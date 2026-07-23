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

function getNextCode(codes, prefix) {
    let max = 0;
    const pattern = new RegExp(`^${prefix}-(\\d+)$`);

    for (const code of codes) {
        const match = String(code).match(pattern);
        if (!match) continue;

        const number = Number(match[1]);
        if (Number.isFinite(number) && number > max) max = number;
    }

    return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

async function generateNextTeacherCode(connection = db) {
    const [rows] = await connection.query(
        "SELECT teacher_code FROM teachers WHERE teacher_code REGEXP '^TCH-[0-9]+$'"
    );
    return getNextCode(rows.map((row) => row.teacher_code), "TCH");
}

export async function getNextTeacherCode(req, res) {
    try {
        const nextCode = await generateNextTeacherCode();
        return res.json({ success: true, data: { nextCode } });
    } catch (error) {
        console.error("Get next teacher code error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate the next Teacher ID.",
        });
    }
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
      ORDER BY t.teacher_code ASC`
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
    let connection;
    let codeLockAcquired = false;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const {
            teacherCode: requestedTeacherCode,
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

        if (!firstName || !lastName || !gender || !department) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "First name, last name, gender, and department are required.",
            });
        }

        let teacherCode = String(requestedTeacherCode || "").trim();
        if (!teacherCode) {
            const [lockRows] = await connection.query(
                "SELECT GET_LOCK('sms_teacher_code_generation', 10) AS acquired"
            );
            codeLockAcquired = Number(lockRows[0]?.acquired) === 1;

            if (!codeLockAcquired) {
                await connection.rollback();
                return res.status(503).json({
                    success: false,
                    message: "Teacher ID generation is busy. Please try again.",
                });
            }

            teacherCode = await generateNextTeacherCode(connection);
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
                teacherCode,
                username,
                defaultPassword: password ? undefined : "Teacher@123",
            },
        });
    } catch (error) {
        if (connection) await connection.rollback();

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Teacher ID or username already exists. Please try again.",
            });
        }

        console.error("Create teacher error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create teacher",
            error: error.message,
        });
    } finally {
        if (connection && codeLockAcquired) {
            try {
                await connection.query("SELECT RELEASE_LOCK('sms_teacher_code_generation')");
            } catch (error) {
                console.error("Release teacher code lock error:", error);
            }
        }
        connection?.release();
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

export async function getMyTeacherInfo(req, res) {
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
        d.department_code AS departmentCode,
        d.department_name AS department,
        u.username,
        u.role,
        u.status,
        t.created_at AS createdAt,
        t.updated_at AS updatedAt
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.user_id
      LEFT JOIN departments d ON t.department_id = d.department_id
      WHERE t.user_id = ?
      LIMIT 1`,
            [req.user.user_id]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Teacher profile not found.",
            });
        }

        const teacher = teachers[0];

        res.json({
            success: true,
            data: {
                ...teacher,
                fullName: `${teacher.firstName} ${teacher.lastName}`,
                gender: teacher.gender
                    ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)
                    : "",
                status: teacher.status
                    ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)
                    : "Active",
                department: teacher.department || "No Department",
            },
        });
    } catch (error) {
        console.error("Get my teacher info error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch teacher information.",
            error: error.message,
        });
    }
}

export async function getTeacherClasses(req, res) {
    try {
        const { id } = req.params;
        const [teachers] = await db.query(
            `SELECT t.teacher_id AS id, t.teacher_code AS teacherCode,
                    CONCAT(t.first_name, ' ', t.last_name) AS fullName,
                    t.email, t.phone
             FROM teachers t WHERE t.teacher_id = ? LIMIT 1`,
            [id]
        );

        if (!teachers.length) {
            return res.status(404).json({ success: false, message: "Teacher not found." });
        }

        const [courses] = await db.query(
            `SELECT c.course_id AS id, c.course_code AS courseCode,
                    c.course_name AS courseName, c.credit, c.semester, c.status,
                    d.department_name AS department,
                    COUNT(DISTINCT e.student_id) AS enrolledStudentCount
             FROM courses c
             LEFT JOIN departments d ON d.department_id = c.department_id
             LEFT JOIN enrollments e ON e.course_id = c.course_id
             WHERE c.teacher_id = ?
             GROUP BY c.course_id
             ORDER BY c.course_code ASC`,
            [id]
        );

        const formatCourse = (course) => ({
            ...course,
            department: course.department || "No Department",
            semester: course.semester || "",
            enrolledStudentCount: Number(course.enrolledStudentCount || 0),
            status: course.status === "active" ? "Active" : "Inactive",
        });

        return res.json({
            success: true,
            data: {
                teacher: teachers[0],
                currentClasses: courses.filter((course) => course.status === "active").map(formatCourse),
                pastClasses: courses.filter((course) => course.status === "inactive").map(formatCourse),
            },
        });
    } catch (error) {
        console.error("Get teacher classes error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch teacher classes." });
    }
}
