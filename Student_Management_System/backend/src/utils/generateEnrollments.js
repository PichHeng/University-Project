import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import db from "../config/db.js";

const COURSES_PER_STUDENT = 3;
const SKIP_CONFIRMATION_FLAG = "--yes";

async function confirmReplacement() {
    if (process.argv.slice(2).includes(SKIP_CONFIRMATION_FLAG)) {
        return true;
    }

    const readline = createInterface({ input, output });

    try {
        const answer = await readline.question('Type "YES" to replace all enrollments: ');
        return answer.trim() === "YES";
    } finally {
        readline.close();
    }
}

function buildEnrollmentRows(students, courses) {
    const rows = [];
    const studentCoursePairs = new Set();

    for (const [studentIndex, student] of students.entries()) {
        for (let offset = 0; offset < COURSES_PER_STUDENT; offset += 1) {
            const course = courses[(studentIndex + offset) % courses.length];
            const pairKey = `${student.student_id}:${course.course_id}`;

            if (studentCoursePairs.has(pairKey)) {
                throw new Error(
                    `Duplicate enrollment generated for ${student.student_code} and ${course.course_code}.`
                );
            }

            studentCoursePairs.add(pairKey);
            rows.push([student.student_id, course.course_id]);
        }
    }

    return rows;
}

async function generateEnrollments() {
    console.log("Starting enrollment generation");

    const confirmed = await confirmReplacement();
    if (!confirmed) {
        console.log("Enrollment generation cancelled. No records were changed.");
        return;
    }

    const connection = await db.getConnection();
    let transactionStarted = false;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [students] = await connection.execute(
            `SELECT student_id, student_code
             FROM students
             ORDER BY student_code ASC
             FOR UPDATE`
        );
        const [courses] = await connection.execute(
            `SELECT course_id, course_code
             FROM courses
             WHERE course_code LIKE 'CRS-%'
             ORDER BY course_code ASC
             FOR UPDATE`
        );

        console.log(`Students found: ${students.length}`);
        console.log(`Courses found: ${courses.length}`);
        console.log(`Courses per student: ${COURSES_PER_STUDENT}`);

        if (!students.length) {
            throw new Error("No students found. Import students before generating enrollments.");
        }
        if (courses.length < COURSES_PER_STUDENT) {
            throw new Error(
                `At least ${COURSES_PER_STUDENT} imported courses are required; found ${courses.length}.`
            );
        }

        const enrollmentRows = buildEnrollmentRows(students, courses);

        console.log("Deleting old attendance/grades/enrollments");
        await connection.execute(
            `DELETE a
             FROM attendance a
             INNER JOIN enrollments e ON e.enrollment_id = a.enrollment_id`
        );
        await connection.execute(
            `DELETE g
             FROM grades g
             INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id`
        );
        await connection.execute("DELETE FROM enrollments");

        console.log("Inserting enrollments");
        let insertedCount = 0;

        for (const [studentId, courseId] of enrollmentRows) {
            const [result] = await connection.execute(
                `INSERT INTO enrollments
                    (student_id, course_id, enrollment_date, status)
                 VALUES (?, ?, CURDATE(), 'active')`,
                [studentId, courseId]
            );

            insertedCount += result.affectedRows;
            if (insertedCount % 20 === 0) {
                console.log(`Progress: ${insertedCount} enrollments inserted`);
            }
        }

        if (insertedCount !== enrollmentRows.length) {
            throw new Error(
                `Expected to insert ${enrollmentRows.length} enrollments, but inserted ${insertedCount}.`
            );
        }

        await connection.commit();
        transactionStarted = false;

        console.log("Enrollment generation completed successfully");
        console.log(`Total inserted: ${insertedCount}`);
    } catch (error) {
        if (transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(`Enrollment rollback failed: ${rollbackError.message}`);
            }
        }

        throw error;
    } finally {
        connection.release();
    }
}

generateEnrollments()
    .catch((error) => {
        console.error(`Enrollment generation failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
