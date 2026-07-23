import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "csv-parse/sync";

import db from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.resolve(__dirname, "../../../database/department-list.csv");

async function readDepartments() {
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

    const requiredColumns = ["DepartmentCode", "DepartmentName", "Description"];
    const missingColumns = requiredColumns.filter(
        (column) => !availableColumns.includes(column)
    );

    if (missingColumns.length) {
        throw new Error(`Missing required CSV column(s): ${missingColumns.join(", ")}`);
    }

    return records;
}

async function importDepartments() {
    console.log("Starting department import");
    console.log(`CSV path: ${csvPath}`);

    const records = await readDepartments();
    console.log(`Parsed department count: ${records.length}`);

    const connection = await db.getConnection();
    let transactionStarted = false;
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    try {
        await connection.beginTransaction();
        transactionStarted = true;

        for (const [index, record] of records.entries()) {
            const departmentCode = String(record.DepartmentCode ?? "").trim();
            const departmentName = String(record.DepartmentName ?? "").trim();
            const description = String(record.Description ?? "").trim();

            if (!departmentCode || !departmentName) {
                skippedCount += 1;
                console.warn(
                    `Skipped CSV row ${index + 2}: DepartmentCode and DepartmentName are required.`
                );
                continue;
            }

            const [existingDepartments] = await connection.execute(
                `SELECT department_id
                 FROM departments
                 WHERE department_code = ?
                 LIMIT 1`,
                [departmentCode]
            );

            if (existingDepartments.length) {
                await connection.execute(
                    `UPDATE departments
                     SET department_name = ?, description = ?
                     WHERE department_code = ?`,
                    [departmentName, description, departmentCode]
                );
                updatedCount += 1;
            } else {
                await connection.execute(
                    `INSERT INTO departments
                        (department_code, department_name, description)
                     VALUES (?, ?, ?)`,
                    [departmentCode, departmentName, description]
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

importDepartments()
    .catch((error) => {
        console.error(`Department import failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.end();
    });
