import db from "../config/db.js";

export async function getDepartments(req, res) {
    try {
        const [departments] = await db.query(
            `SELECT
        d.department_id AS id,
        d.department_code AS departmentCode,
        d.department_name AS departmentName,
        d.description,
        COUNT(DISTINCT s.student_id) AS totalStudents,
        COUNT(DISTINCT t.teacher_id) AS totalTeachers,
        d.created_at AS createdAt,
        d.updated_at AS updatedAt
      FROM departments d
      LEFT JOIN students s ON d.department_id = s.department_id
      LEFT JOIN teachers t ON d.department_id = t.department_id
      GROUP BY d.department_id
      ORDER BY d.department_code ASC`
        );

        res.json({
            success: true,
            data: departments,
        });
    } catch (error) {
        console.error("Get departments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
            error: error.message,
        });
    }
}

export async function createDepartment(req, res) {
    try {
        const { departmentCode, departmentName, description } = req.body;

        if (!departmentCode || !departmentName) {
            return res.status(400).json({
                success: false,
                message: "Department code and department name are required.",
            });
        }

        const [result] = await db.query(
            `INSERT INTO departments
        (department_code, department_name, description)
       VALUES (?, ?, ?)`,
            [departmentCode, departmentName, description || null]
        );

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: {
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error("Create department error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create department",
            error: error.message,
        });
    }
}

export async function updateDepartment(req, res) {
    try {
        const { id } = req.params;
        const { departmentCode, departmentName, description } = req.body;

        if (!departmentCode || !departmentName) {
            return res.status(400).json({
                success: false,
                message: "Department code and department name are required.",
            });
        }

        const [result] = await db.query(
            `UPDATE departments
       SET
        department_code = ?,
        department_name = ?,
        description = ?
       WHERE department_id = ?`,
            [departmentCode, departmentName, description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found.",
            });
        }

        res.json({
            success: true,
            message: "Department updated successfully",
        });
    } catch (error) {
        console.error("Update department error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update department",
            error: error.message,
        });
    }
}

export async function deleteDepartment(req, res) {
    try {
        const { id } = req.params;

        const [usage] = await db.query(
            `SELECT
        (SELECT COUNT(*) FROM students WHERE department_id = ?) AS studentCount,
        (SELECT COUNT(*) FROM teachers WHERE department_id = ?) AS teacherCount`,
            [id, id]
        );

        const studentCount = usage[0].studentCount;
        const teacherCount = usage[0].teacherCount;

        if (studentCount > 0 || teacherCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete this department because it is already used by students or teachers.",
            });
        }

        const [result] = await db.query(
            "DELETE FROM departments WHERE department_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found.",
            });
        }

        res.json({
            success: true,
            message: "Department deleted successfully",
        });
    } catch (error) {
        console.error("Delete department error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete department",
            error: error.message,
        });
    }
}

export async function getDepartmentDetails(req, res) {
    try {
        const { id } = req.params;
        const [departments] = await db.query(
            `SELECT department_id AS id, department_code AS departmentCode,
                    department_name AS departmentName, description,
                    created_at AS createdAt, updated_at AS updatedAt
             FROM departments WHERE department_id = ? LIMIT 1`,
            [id]
        );

        if (!departments.length) {
            return res.status(404).json({ success: false, message: "Department not found." });
        }

        const [students] = await db.query(
            `SELECT student_id AS id, student_code AS studentCode,
                    first_name AS firstName, last_name AS lastName,
                    CONCAT(first_name, ' ', last_name) AS fullName,
                    year_level AS yearLevel, email, status
             FROM students WHERE department_id = ?
             ORDER BY student_code ASC`,
            [id]
        );
        const [teachers] = await db.query(
            `SELECT teacher_id AS id, teacher_code AS teacherCode,
                    first_name AS firstName, last_name AS lastName,
                    CONCAT(first_name, ' ', last_name) AS fullName,
                    email, phone
             FROM teachers WHERE department_id = ?
             ORDER BY teacher_code ASC`,
            [id]
        );

        return res.json({
            success: true,
            data: {
                department: { ...departments[0], description: departments[0].description || "" },
                students,
                teachers,
                totalStudents: students.length,
                totalTeachers: teachers.length,
                homeroomTeacher: null,
                homeroomSupported: false,
            },
        });
    } catch (error) {
        console.error("Get department details error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch department details." });
    }
}
