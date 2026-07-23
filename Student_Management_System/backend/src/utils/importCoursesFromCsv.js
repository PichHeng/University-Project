import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";

import db from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const expectedCsvPath = path.resolve(__dirname, "../../../database/course-list.csv");
const legacyCsvPath = path.resolve(__dirname, "../../../database/courses-list.csv");
const defaultCredit = 3;
const defaultSemester = "Year 2 Semester 1";
const defaultStatus = "active";
const departmentCodesByCourseName = new Map(
    [
        ["Arts and Humanities", "AH"],
        ["Business and Management", "BM"],
        ["Engineering and Technology", "ET"],
        ["Physical and Life Sciences", "PLS"],
        ["Social Sciences", "SS"],
        ["Health and Medicine", "HM"],
        ["Applied and Vocational Studies", "AVS"],
        ["Computer Science", "CS"],
        ["Information Technology", "IT"],
        ["Medical Science", "MS"],
    ].map(([courseName, departmentCode]) => [courseName.toLowerCase(), departmentCode])
);

async function readCsvFile() {
    try {
        return { csvPath: expectedCsvPath, csvText: await readFile(expectedCsvPath, "utf8") };
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
    }

    try {
        const csvText = await readFile(legacyCsvPath, "utf8");
        console.warn(
            `Expected course-list.csv was not found; using existing ${path.basename(legacyCsvPath)}.`
        );
        return { csvPath: legacyCsvPath, csvText };
    } catch (error) {
        if (error.code === "ENOENT") {
            throw new Error(`Course CSV file not found at ${expectedCsvPath}`);
        }
        throw error;
    }
}

async function readCourseRecords() {
    const { csvPath, csvText } = await readCsvFile();
    let availableColumns = [];
    const records = parse(csvText, {
        bom: true,
        columns: (headers) => {
            availableColumns = headers.map((header) => header.trim());
            return availableColumns;
        },
        skip_empty_lines: true,
        trim: true,
    });

    const requiredColumns = ["No", "CourseName", "Description"];
    const missingColumns = requiredColumns.filter(
        (column) => !availableColumns.includes(column)
    );

    if (missingColumns.length) {
        throw new Error(`Missing required CSV column(s): ${missingColumns.join(", ")}`);
    }

    return { csvPath, records };
}

function createCourse(record, csvRow) {
    const numberText = String(record.No ?? "").trim();
    const courseName = String(record.CourseName ?? "").trim();

    if (!/^\d+$/u.test(numberText) || !courseName) {
        console.warn(
            `Skipped CSV row ${csvRow}: No must be a positive integer and CourseName is required.`
        );
        return null;
    }

    const number = Number(numberText);
    if (!Number.isSafeInteger(number) || number <= 0) {
        console.warn(`Skipped CSV row ${csvRow}: No must be a positive safe integer.`);
        return null;
    }

    return {
        courseCode: `CRS-${String(number).padStart(4, "0")}`,
        courseName,
        description: String(record.Description ?? "").trim(),
        departmentCode: departmentCodesByCourseName.get(courseName.toLowerCase()),
    };
}

async function importCourses() {
    console.log("Starting course import");

    const { csvPath, records } = await readCourseRecords();
    console.log(`CSV path: ${csvPath}`);
    console.log(`Parsed course count: ${records.length}`);

    const connection = await db.getConnection();
    let transactionStarted = false;
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let assignedCourseCount = 0;
    const seenCourseCodes = new Set();

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [teachers] = await connection.execute(
            `SELECT teacher_id, teacher_code
             FROM teachers
             ORDER BY teacher_code`
        );
        console.log(`Teachers found: ${teachers.length}`);

        if (!teachers.length) {
            throw new Error("No teachers found. Please import teachers before importing courses.");
        }

        for (const [index, record] of records.entries()) {
            const csvRow = index + 2;
            const course = createCourse(record, csvRow);

            if (!course) {
                skippedCount += 1;
                continue;
            }

            if (seenCourseCodes.has(course.courseCode)) {
                skippedCount += 1;
                console.warn(`Skipped CSV row ${csvRow}: duplicate No value.`);
                continue;
            }
            seenCourseCodes.add(course.courseCode);

            if (!course.departmentCode) {
                skippedCount += 1;
                console.warn(
                    `Skipped ${course.courseCode} (${course.courseName}): no department mapping exists.`
                );
                continue;
            }

            const [departments] = await connection.execute(
                `SELECT department_id
                 FROM departments
                 WHERE department_code = ?
                 LIMIT 1`,
                [course.departmentCode]
            );

            if (!departments.length) {
                skippedCount += 1;
                console.warn(
                    `Skipped ${course.courseCode} (${course.courseName}): department ${course.departmentCode} does not exist.`
                );
                continue;
            }

            const departmentId = departments[0].department_id;
            const teacherId = teachers[assignedCourseCount % teachers.length].teacher_id;
            assignedCourseCount += 1;

            const [existingCourses] = await connection.execute(
                `SELECT course_id
                 FROM courses
                 WHERE course_code = ?
                 LIMIT 1`,
                [course.courseCode]
            );

            if (existingCourses.length) {
                await connection.execute(
                    `UPDATE courses
                     SET course_name = ?, description = ?, credit = ?, semester = ?,
                         department_id = ?, teacher_id = ?, status = ?
                     WHERE course_code = ?`,
                    [
                        course.courseName,
                        course.description,
                        defaultCredit,
                        defaultSemester,
                        departmentId,
                        teacherId,
                        defaultStatus,
                        course.courseCode,
                    ]
                );
                updatedCount += 1;
            } else {
                await connection.execute(
                    `INSERT INTO courses
                        (department_id, teacher_id, course_code, course_name, credit,
                         semester, description, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        departmentId,
                        teacherId,
                        course.courseCode,
                        course.courseName,
                        defaultCredit,
                        defaultSemester,
                        course.description,
                        defaultStatus,
                    ]
                );
                insertedCount += 1;
            }
        }

        await connection.commit();
        transactionStarted = false;

        console.log(`Inserted count: ${insertedCount}`);
        console.log(`Updated count: ${updatedCount}`);
        console.log(`Skipped count: ${skippedCount}`);
        console.log("Import completed successfully");
    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }
        throw error;
    } finally {
        connection.release();
    }
}

importCourses()
    .catch((error) => {
        console.error(`Course import failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
