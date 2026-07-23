import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

import bcrypt from "bcrypt";
import ExcelJS from "exceljs";

import db from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workbookPath = path.resolve(__dirname, "../../../database/student-list.xlsx");
const csvPath = path.resolve(__dirname, "../../../database/student-list.csv");
const departmentCode = "ITE";
const departmentName = "Information Technology Engineering";
const defaultPassword = "Student@123";
const skipConfirmation = process.argv.includes("--yes");

async function confirmImport() {
    const readline = createInterface({ input, output });

    try {
        const answer = await readline.question(
            'Type "YES" to replace all existing student data: '
        );

        if (answer.trim() !== "YES") {
            console.log("Import cancelled. No database changes were made.");
            return false;
        }

        console.log("Import confirmed.");
        return true;
    } finally {
        readline.close();
    }
}

function createStudent(sourceRow, sourceNumber, fullNameValue, genderValue) {
    const fullName = String(fullNameValue || "").trim();
    const genderText = String(genderValue || "").trim();
    const number = Number(sourceNumber);

    if (!Number.isFinite(number) || !fullName || !genderText) return null;

    const [firstName, ...remainingNames] = fullName.split(/\s+/u);
    return {
        sourceRow,
        sourceNumber: number,
        firstName,
        lastName: remainingNames.join(" ") || "-",
        gender: genderText === "ប" ? "male" : genderText === "ស" ? "female" : "other",
    };
}

async function parseStudentsFromExcel() {
    if (!existsSync(workbookPath)) {
        throw new Error(`Excel file not found at ${workbookPath}`);
    }

    console.log(`Excel path: ${workbookPath}`);
    console.log("Loading workbook with ExcelJS...");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(workbookPath);

    console.log("Workbook loaded.");
    console.log(
        `Available sheets: ${workbook.worksheets.map((sheet) => sheet.name).join(", ") || "none"}`
    );

    const worksheet = workbook.getWorksheet("Sheet1") || workbook.worksheets[0];
    if (!worksheet) throw new Error("No worksheet was found in the Excel workbook.");

    console.log(`Worksheet used: ${worksheet.name}`);

    const students = [];
    const skippedRows = [];

    for (let rowNumber = 9; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        const row = worksheet.getRow(rowNumber);
        const numberValue = row.getCell(1).value;
        const fullName = row.getCell(2).text || String(row.getCell(2).value || "");
        const genderValue = row.getCell(3).text || String(row.getCell(3).value || "");
        const hasData = [numberValue, fullName, genderValue].some(
            (value) => String(value ?? "").trim() !== ""
        );

        if (!hasData) continue;

        const student = createStudent(rowNumber, numberValue, fullName, genderValue);
        if (student) {
            students.push(student);
        } else {
            skippedRows.push({
                row: rowNumber,
                reason: "Expected a numeric value, Khmer name, and gender in columns A-C.",
            });
        }
    }

    if (!students.length) {
        throw new Error(`No valid student rows were found in ${worksheet.name} from row 9 onward.`);
    }

    console.log(`Parsed student count: ${students.length}`);
    return { students, skippedRows, source: "excel", sheetName: worksheet.name };
}

function parseCsvLine(line) {
    const fields = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];

        if (character === '"') {
            if (quoted && line[index + 1] === '"') {
                current += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (character === "," && !quoted) {
            fields.push(current);
            current = "";
        } else {
            current += character;
        }
    }

    fields.push(current);
    return fields;
}

function parseStudentsFromCsv() {
    if (!existsSync(csvPath)) {
        throw new Error(`CSV fallback file not found at ${csvPath}`);
    }

    console.log(`CSV path: ${csvPath}`);
    console.log("Loading UTF-8 CSV fallback...");

    const csvText = readFileSync(csvPath, "utf8").replace(/^\uFEFF/u, "");
    const lines = csvText.split(/\r?\n/u);
    const students = [];
    const skippedRows = [];

    lines.forEach((line, index) => {
        if (!line.trim()) return;

        const [numberValue, fullName, genderValue] = parseCsvLine(line);
        if (index === 0 && String(numberValue).trim().toLowerCase() === "no") return;

        const student = createStudent(index + 1, numberValue, fullName, genderValue);
        if (student) {
            students.push(student);
        } else {
            skippedRows.push({
                row: index + 1,
                reason: "Expected No, Name, and Gender columns.",
            });
        }
    });

    if (!students.length) throw new Error("No valid student rows were found in the CSV file.");

    console.log(`Parsed student count: ${students.length}`);
    return { students, skippedRows, source: "csv", sheetName: null };
}

async function parseStudents() {
    try {
        return await parseStudentsFromExcel();
    } catch (excelError) {
        console.error(`Excel parsing failed: ${excelError.message}`);
        console.log("Trying CSV fallback...");

        try {
            return parseStudentsFromCsv();
        } catch (csvError) {
            throw new Error(
                `${csvError.message}\n` +
                "Open the Excel file, choose Save As CSV UTF-8, save it as " +
                `${csvPath}, then run npm run import:students -- --yes again.`
            );
        }
    }
}

async function resolveDepartment(connection) {
    const [byName] = await connection.query(
        `SELECT department_id AS id, department_name AS name
         FROM departments WHERE department_name = ? LIMIT 1`,
        [departmentName]
    );
    if (byName.length) return byName[0];

    const [byCode] = await connection.query(
        "SELECT department_id AS id FROM departments WHERE department_code = ? LIMIT 1",
        [departmentCode]
    );

    if (byCode.length) {
        await connection.query(
            "UPDATE departments SET department_name = ? WHERE department_id = ?",
            [departmentName, byCode[0].id]
        );
        return { id: byCode[0].id, name: departmentName };
    }

    const [result] = await connection.query(
        `INSERT INTO departments (department_code, department_name, description)
         VALUES (?, ?, ?)`,
        [departmentCode, departmentName, "Information Technology Engineering department"]
    );
    return { id: result.insertId, name: departmentName };
}

async function importStudents() {
    console.log("Starting student import...");
    console.log("WARNING: This replaces existing student users, profiles, and related academic records.");
    console.log("Admin users, teacher users, departments, teachers, courses, and assignments are preserved.");

    if (skipConfirmation) {
        console.log("Confirmation skipped because --yes was provided.");
    } else if (!(await confirmImport())) {
        return;
    }

    const { students, skippedRows, source, sheetName } = await parseStudents();

    console.log("Hashing the default student password...");
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    console.log("Connecting to database...");
    const connection = await db.getConnection();
    let inserted = 0;

    try {
        await connection.query("SET NAMES utf8mb4");
        console.log("Starting transaction...");
        await connection.beginTransaction();

        console.log("Resolving department...");
        const department = await resolveDepartment(connection);

        console.log("Deleting old student-related data...");
        await connection.query(
            `DELETE a FROM attendance a
             INNER JOIN enrollments e ON e.enrollment_id = a.enrollment_id
             INNER JOIN students s ON s.student_id = e.student_id`
        );
        await connection.query(
            `DELETE g FROM grades g
             INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
             INNER JOIN students s ON s.student_id = e.student_id`
        );
        await connection.query(
            `DELETE e FROM enrollments e
             INNER JOIN students s ON s.student_id = e.student_id`
        );
        await connection.query("DELETE FROM students");
        await connection.query("DELETE FROM users WHERE role = 'student'");

        console.log("Inserting students...");
        for (const [index, student] of students.entries()) {
            const sequence = String(index + 1).padStart(4, "0");
            const studentCode = `STU-${sequence}`;
            const username = `stu-${sequence}`;
            const [userResult] = await connection.query(
                `INSERT INTO users (username, password_hash, role, status)
                 VALUES (?, ?, 'student', 'active')`,
                [username, passwordHash]
            );

            await connection.query(
                `INSERT INTO students
                    (user_id, department_id, student_code, first_name, last_name, gender,
                     date_of_birth, email, phone, address, year_level, status)
                 VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, 2, 'active')`,
                [userResult.insertId, department.id, studentCode, student.firstName, student.lastName, student.gender]
            );

            inserted += 1;
            if (inserted % 10 === 0 || inserted === students.length) {
                console.log(`Inserted ${inserted}/${students.length} students...`);
            }
        }

        console.log("Committing transaction...");
        await connection.commit();

        console.log("\nStudent import completed successfully.");
        console.log(`Source: ${source}${sheetName ? ` (${sheetName})` : ""}`);
        console.log(`Total parsed: ${students.length}`);
        console.log(`Total inserted: ${inserted}`);
        console.log(`Skipped rows: ${skippedRows.length}`);
        console.log(`Department used: ${departmentName} (${departmentCode})`);
        console.log(`Generated accounts: stu-0001 through stu-${String(inserted).padStart(4, "0")}`);
        console.log(`Default password: ${defaultPassword}`);
        if (skippedRows.length) console.table(skippedRows);
    } catch (error) {
        console.error("Import error detected. Rolling back transaction...");
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

importStudents()
    .catch((error) => {
        console.error(`Import failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
