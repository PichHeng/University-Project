import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import bcrypt from "bcrypt";
import { parse } from "csv-parse/sync";

import db from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.resolve(__dirname, "../../../database/teacher-list.csv");
const defaultPassword = "Teacher@123";
const defaultDepartment = {
    code: "EDU",
    name: "Education",
    description:
        "Teaching, learning methods, curriculum development, and classroom management.",
};

async function readTeacherRecords() {
    const csvText = await readFile(csvPath, "utf8");
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

    const requiredColumns = ["No", "Name", "Gender"];
    const missingColumns = requiredColumns.filter(
        (column) => !availableColumns.includes(column)
    );

    if (missingColumns.length) {
        throw new Error(`Missing required CSV column(s): ${missingColumns.join(", ")}`);
    }

    return records;
}

function createTeacher(record, csvRow) {
    const numberText = String(record.No ?? "").trim();
    const fullName = String(record.Name ?? "").trim();

    if (!/^\d+$/u.test(numberText) || !fullName) {
        console.warn(`Skipped CSV row ${csvRow}: No must be a positive integer and Name is required.`);
        return null;
    }

    const number = Number(numberText);
    if (!Number.isSafeInteger(number) || number <= 0) {
        console.warn(`Skipped CSV row ${csvRow}: No must be a positive safe integer.`);
        return null;
    }

    const [firstName, ...remainingNames] = fullName.split(/\s+/u);
    const genderText = String(record.Gender ?? "").trim().toLowerCase();
    const sequence = String(number).padStart(4, "0");
    const teacherCode = `TCH-${sequence}`;

    return {
        teacherCode,
        username: teacherCode.toLowerCase(),
        firstName,
        lastName: remainingNames.join(" ") || "-",
        gender: genderText === "male" || genderText === "female" ? genderText : "other",
    };
}

async function resolveDefaultDepartment(connection) {
    const [departments] = await connection.execute(
        `SELECT department_id
         FROM departments
         WHERE department_code = ?
         LIMIT 1`,
        [defaultDepartment.code]
    );

    if (departments.length) {
        return departments[0].department_id;
    }

    const [result] = await connection.execute(
        `INSERT INTO departments (department_code, department_name, description)
         VALUES (?, ?, ?)`,
        [defaultDepartment.code, defaultDepartment.name, defaultDepartment.description]
    );

    return result.insertId;
}

async function resolveUser(connection, teacher, passwordHash, existingUserId) {
    let userId = existingUserId;

    if (!userId) {
        const [users] = await connection.execute(
            `SELECT u.user_id, u.role, t.teacher_code
             FROM users u
             LEFT JOIN teachers t ON t.user_id = u.user_id
             WHERE u.username = ?
             LIMIT 1`,
            [teacher.username]
        );

        const matchingUser = users[0];
        if (matchingUser?.role && matchingUser.role !== "teacher") {
            throw new Error(
                `Username ${teacher.username} already belongs to a ${matchingUser.role} account.`
            );
        }
        if (matchingUser?.teacher_code) {
            throw new Error(
                `Username ${teacher.username} is already linked to teacher ${matchingUser.teacher_code}.`
            );
        }

        userId = matchingUser?.user_id;
    }

    if (userId) {
        await connection.execute(
            `UPDATE users
             SET username = ?, password_hash = ?, role = 'teacher', status = 'active'
             WHERE user_id = ?`,
            [teacher.username, passwordHash, userId]
        );
        return userId;
    }

    const [result] = await connection.execute(
        `INSERT INTO users (username, password_hash, role, status)
         VALUES (?, ?, 'teacher', 'active')`,
        [teacher.username, passwordHash]
    );

    return result.insertId;
}

async function importTeachers() {
    console.log("Starting teacher import");
    console.log(`CSV path: ${csvPath}`);

    const records = await readTeacherRecords();
    console.log(`Parsed teacher count: ${records.length}`);

    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    const connection = await db.getConnection();
    let transactionStarted = false;
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const generatedAccounts = [];
    const seenTeacherCodes = new Set();

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        console.log("Resolving default department");
        const departmentId = await resolveDefaultDepartment(connection);

        for (const [index, record] of records.entries()) {
            const teacher = createTeacher(record, index + 2);

            if (!teacher) {
                skippedCount += 1;
                continue;
            }

            if (seenTeacherCodes.has(teacher.teacherCode)) {
                skippedCount += 1;
                console.warn(`Skipped CSV row ${index + 2}: duplicate No value.`);
                continue;
            }
            seenTeacherCodes.add(teacher.teacherCode);

            const [existingTeachers] = await connection.execute(
                `SELECT teacher_id, user_id
                 FROM teachers
                 WHERE teacher_code = ?
                 LIMIT 1`,
                [teacher.teacherCode]
            );
            const existingTeacher = existingTeachers[0];
            const userId = await resolveUser(
                connection,
                teacher,
                passwordHash,
                existingTeacher?.user_id
            );

            if (existingTeacher) {
                await connection.execute(
                    `UPDATE teachers
                     SET user_id = ?, department_id = ?, first_name = ?, last_name = ?, gender = ?
                     WHERE teacher_code = ?`,
                    [
                        userId,
                        departmentId,
                        teacher.firstName,
                        teacher.lastName,
                        teacher.gender,
                        teacher.teacherCode,
                    ]
                );
                updatedCount += 1;
            } else {
                await connection.execute(
                    `INSERT INTO teachers
                        (user_id, department_id, teacher_code, first_name, last_name, gender)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        departmentId,
                        teacher.teacherCode,
                        teacher.firstName,
                        teacher.lastName,
                        teacher.gender,
                    ]
                );
                insertedCount += 1;
            }

            generatedAccounts.push(teacher.username);
        }

        await connection.commit();
        transactionStarted = false;

        console.log(`Inserted count: ${insertedCount}`);
        console.log(`Updated count: ${updatedCount}`);
        console.log(`Skipped count: ${skippedCount}`);
        console.log("Import completed successfully");
        console.log(
            `Generated accounts: ${generatedAccounts.length
                ? `${generatedAccounts[0]} through ${generatedAccounts.at(-1)}`
                : "none"}`
        );
        console.log(`Default password: ${defaultPassword}`);
    } catch (error) {
        if (transactionStarted) {
            await connection.rollback();
        }
        throw error;
    } finally {
        connection.release();
    }
}

importTeachers()
    .catch((error) => {
        console.error(`Teacher import failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
