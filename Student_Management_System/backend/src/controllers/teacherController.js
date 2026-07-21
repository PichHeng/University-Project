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

function toDbUserStatus(status) {
    return status?.toLowerCase() === "inactive" ? "inactive" : "active";
}

function createUsernameFromTeacherCode(teacherCode) {
    return teacherCode.toLowerCase().replace(/\s+/g, "");
}

async function findDepartmentId(connection, departmentName) {
    const [departments] = await connection.query(
        `SELECT department_id
     FROM departments
     WHERE department_name = ?
     LIMIT 1`,
        [departmentName]
    );

    if (departments.length === 0) return null;

    return departments[0].department_id;
}

export async function getTeachers(req, res) {
    try {
        const [teachers] = await db.query(
            `SELECT
        t.teacher_id AS id,
        t.user_id AS userId,
        t.teacher_code AS teacherCode,
        t.first_name AS firstName,
        t.last_name AS lastName,
        t.gender,
        t.email,
        t.phone,
        t.address,
        d.department_name AS department,
        u.username,
        u.status
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.user_id
      LEFT JOIN departments d ON t.department_id = d.department_id
      ORDER BY t.teacher_id DESC`
        );

        const formattedTeachers = teachers.map((teacher) => ({
            ...teacher,
            gender: formatGender(teacher.gender),
            department: teacher.department || "No Department",
            email: teacher.email || "",
            phone: teacher.phone || "",
            address: teacher.address || "",
            status: formatStatus(teacher.status),
        }));

        res.json({
            success: true,
            data: formattedTeachers,
        });
    } catch (error) {
        console.error("Get teachers error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teachers",
            error: error.message,
        });
    }
}

export async function createTeacher(req, res) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            teacherCode,
            firstName,
            lastName,
            gender,
            department,
            phone,
            email,
            address,
            status,
            password,
        } = req.body;

        if (!teacherCode || !firstName || !lastName || !gender || !department) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Teacher ID, first name, last name, gender, and department are required.",
            });
        }

        const departmentId = await findDepartmentId(connection, department);

        if (!departmentId) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Department not found. Please create the department first.",
            });
        }

        const username = createUsernameFromTeacherCode(teacherCode);
        const plainPassword = password || "Teacher@123";
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        const dbUserStatus = toDbUserStatus(status);

        const [userResult] = await connection.query(
            `INSERT INTO users
        (username, password_hash, role, status)
       VALUES (?, ?, 'teacher', ?)`,
            [username, passwordHash, dbUserStatus]
        );

        const userId = userResult.insertId;

        const [teacherResult] = await connection.query(
            `INSERT INTO teachers
        (
          user_id,
          department_id,
          teacher_code,
          first_name,
          last_name,
          gender,
          email,
          phone,
          address
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                departmentId,
                teacherCode,
                firstName,
                lastName,
                toDbGender(gender),
                email || null,
                phone || null,
                address || null,
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            data: {
                id: teacherResult.insertId,
                userId,
                username,
                defaultPassword: password ? undefined : "Teacher@123",
            },
        });
    } catch (error) {
        await connection.rollback();

        console.error("Create teacher error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create teacher",
            error: error.message,
        });
    } finally {
        connection.release();
    }
}

export async function updateTeacher(req, res) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const {
            teacherCode,
            firstName,
            lastName,
            gender,
            department,
            phone,
            email,
            address,
            status,
        } = req.body;

        if (!teacherCode || !firstName || !lastName || !gender || !department) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message:
                    "Teacher ID, first name, last name, gender, and department are required.",
            });
        }

        const departmentId = await findDepartmentId(connection, department);

        if (!departmentId) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Department not found. Please create the department first.",
            });
        }

        const [existingTeachers] = await connection.query(
            `SELECT user_id FROM teachers WHERE teacher_id = ? LIMIT 1`,
            [id]
        );

        if (existingTeachers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        const userId = existingTeachers[0].user_id;
        const dbUserStatus = toDbUserStatus(status);

        await connection.query(
            `UPDATE teachers
       SET
        department_id = ?,
        teacher_code = ?,
        first_name = ?,
        last_name = ?,
        gender = ?,
        email = ?,
        phone = ?,
        address = ?
       WHERE teacher_id = ?`,
            [
                departmentId,
                teacherCode,
                firstName,
                lastName,
                toDbGender(gender),
                email || null,
                phone || null,
                address || null,
                id,
            ]
        );

        await connection.query(
            `UPDATE users
       SET username = ?, status = ?
       WHERE user_id = ?`,
            [createUsernameFromTeacherCode(teacherCode), dbUserStatus, userId]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Teacher updated successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Update teacher error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update teacher",
            error: error.message,
        });
    } finally {
        connection.release();
    }
}

export async function deleteTeacher(req, res) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { id } = req.params;

        const [teachers] = await connection.query(
            `SELECT user_id FROM teachers WHERE teacher_id = ? LIMIT 1`,
            [id]
        );

        if (teachers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Teacher not found",
            });
        }

        const userId = teachers[0].user_id;

        await connection.query("DELETE FROM teachers WHERE teacher_id = ?", [id]);
        await connection.query("DELETE FROM users WHERE user_id = ?", [userId]);

        await connection.commit();

        res.json({
            success: true,
            message: "Teacher deleted successfully",
        });
    } catch (error) {
        await connection.rollback();

        console.error("Delete teacher error:", error);

        res.status(500).json({
            success: false,
            message:
                "Failed to delete teacher. This teacher may be assigned to courses.",
            error: error.message,
        });
    } finally {
        connection.release();
    }
}