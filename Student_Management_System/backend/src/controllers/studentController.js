import bcrypt from "bcrypt";

import db from "../config/db.js";

function formatGender(gender) {
    if (!gender) return "";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

function toDbGender(gender) {
    const value = gender?.toLowerCase();

    if (["male", "female", "other"].includes(value)) {
        return value;
    }

    return "other";
}

function formatStatus(status) {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function toDbStudentStatus(status) {
    const value = status?.toLowerCase();

    if (value === "active") return "active";
    if (value === "graduated") return "graduated";
    if (value === "dropped") return "dropped";

    return "active";
}

function studentStatusToUserStatus(status) {
    return status === "active" ? "active" : "inactive";
}

function formatYearLevel(yearLevel) {
    if (!yearLevel) return "Year 1";

    if (typeof yearLevel === "string" && yearLevel.toLowerCase().includes("year")) {
        return yearLevel;
    }

    return `Year ${yearLevel}`;
}

function toDbYearLevel(yearLevel) {
    if (!yearLevel) return 1;

    if (typeof yearLevel === "number") return yearLevel;

    const match = String(yearLevel).match(/\d+/);
    return match ? Number(match[0]) : 1;
}

function createUsernameFromStudentCode(studentCode) {
    return studentCode.toLowerCase().replace(/\s+/g, "");
}

async function findDepartmentId(departmentName) {
    const [departments] = await db.query(
        `SELECT department_id
     FROM departments
     WHERE department_name = ?
     LIMIT 1`,
        [departmentName]
    );

    if (departments.length === 0) return null;

    return departments[0].department_id;
}

export async function getStudents(req, res) {
    try {
        const [students] = await db.query(
            `SELECT
        s.student_id AS id,
        s.user_id AS userId,
        s.student_code AS studentCode,
        s.first_name AS firstName,
        s.last_name AS lastName,
        s.gender,
        s.date_of_birth AS dateOfBirth,
        s.email,
        s.phone,
        s.address,
        s.year_level AS yearLevel,
        s.status,
        d.department_name AS department,
        u.username
      FROM students s
      INNER JOIN users u ON s.user_id = u.user_id
      LEFT JOIN departments d ON s.department_id = d.department_id
      ORDER BY s.student_id DESC`
        );

        const formattedStudents = students.map((student) => ({
            ...student,
            gender: formatGender(student.gender),
            yearLevel: formatYearLevel(student.yearLevel),
            status: formatStatus(student.status),
            department: student.department || "No Department",
            email: student.email || "",
            phone: student.phone || "",
        }));

        res.json({
            success: true,
            data: formattedStudents,
        });
    } catch (error) {
        console.error("Get students error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch students",
            error: error.message,
        });
    }
}

export async function createStudent(req, res) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            studentCode,
            firstName,
            lastName,
            gender,
            department,
            yearLevel,
            phone,
            email,
            status,
            dateOfBirth,
            address,
            password,
        } = req.body;

        if (!studentCode || !firstName || !lastName || !gender || !department) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Student ID, first name, last name, gender, and department are required.",
            });
        }

        const departmentId = await findDepartmentId(department);

        if (!departmentId) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Department not found. Please create the department first.",
            });
        }

        const username = createUsernameFromStudentCode(studentCode);
        const plainPassword = password || "Student@123";
        const passwordHash = await bcrypt.hash(plainPassword, 10);

        const dbStudentStatus = toDbStudentStatus(status);
        const dbUserStatus = studentStatusToUserStatus(dbStudentStatus);

        const [userResult] = await connection.query(
            `INSERT INTO users
        (username, password_hash, role, status)
       VALUES (?, ?, 'student', ?)`,
            [username, passwordHash, dbUserStatus]
        );

        const userId = userResult.insertId;

        const [studentResult] = await connection.query(
            `INSERT INTO students
        (
          user_id,
          department_id,
          student_code,
          first_name,
          last_name,
          gender,
          date_of_birth,
          email,
          phone,
          address,
          year_level,
          status
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                departmentId,
                studentCode,
                firstName,
                lastName,
                toDbGender(gender),
                dateOfBirth || null,
                email || null,
                phone || null,
                address || null,
                toDbYearLevel(yearLevel),
                dbStudentStatus,
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Student created successfully",
            data: {
                id: studentResult.insertId,
                userId,
                username,
                defaultPassword: password ? undefined : "Student@123",
            },
        });
    } catch (error) {
        await connection.rollback();

        console.error("Create student error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create student",
            error: error.message,
        });
    } finally {
        connection.release();
    }
}

export async function updateStudent(req, res) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const {
            studentCode,
            firstName,
            lastName,
            gender,
            department,
            yearLevel,
            phone,
            email,
            status,
            dateOfBirth,
            address,
        } = req.body;

        if (!studentCode || !firstName || !lastName || !gender || !department) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Student ID, first name, last name, gender, and department are required.",
            });
        }

        const departmentId = await findDepartmentId(department);

        if (!departmentId) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Department not found. Please create the department first.",
            });
        }

        const [existingStudents] = await connection.query(
            `SELECT user_id FROM students WHERE student_id = ? LIMIT 1`,
            [id]
        );

        if (existingStudents.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const userId = existingStudents[0].user_id;
        const dbStudentStatus = toDbStudentStatus(status);
        const dbUserStatus = studentStatusToUserStatus(dbStudentStatus);

        await connection.query(
            `UPDATE students
       SET
        department_id = ?,
        student_code = ?,
        first_name = ?,
        last_name = ?,
        gender = ?,
        date_of_birth = ?,
        email = ?,
        phone = ?,
        address = ?,
        year_level = ?,
        status = ?
       WHERE student_id = ?`,
            [
                departmentId,
                studentCode,
                firstName,
                lastName,
                toDbGender(gender),
                dateOfBirth || null,
                email || null,
                phone || null,
                address || null,
                toDbYearLevel(yearLevel),
                dbStudentStatus,
                id,
            ]
        );

        await connection.query(
            `UPDATE users
       SET username = ?, status = ?
       WHERE user_id = ?`,
            [createUsernameFromStudentCode(studentCode), dbUserStatus, userId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Student updated successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Update student error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update student",
            error: error.message,
        });
    } finally {
        connection.release();
    }
}

export async function deleteStudent(req, res) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [students] = await connection.query(
            `SELECT user_id FROM students WHERE student_id = ? LIMIT 1`,
            [id]
        );

        if (students.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const userId = students[0].user_id;

        await connection.query("DELETE FROM students WHERE student_id = ?", [id]);
        await connection.query("DELETE FROM users WHERE user_id = ?", [userId]);

        await connection.commit();

        res.json({
            success: true,
            message: "Student deleted successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Delete student error:", error);

        res.status(500).json({
            success: false,
            message:
                "Failed to delete student. This student may be used in enrollments, attendance, or grades.",
            error: error.message,
        });
    } finally {
        connection.release();
    }
}