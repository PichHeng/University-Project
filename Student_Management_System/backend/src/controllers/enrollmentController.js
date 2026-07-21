import db from "../config/db.js";

function formatStatus(status) {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function toDbStatus(status) {
    const value = status?.toLowerCase();

    if (value === "active") return "active";
    if (value === "completed") return "completed";
    if (value === "dropped") return "dropped";

    return "active";
}

function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return String(dateValue).slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

async function findStudentId(studentCode) {
    const [students] = await db.query(
        `SELECT student_id
     FROM students
     WHERE student_code = ?
     LIMIT 1`,
        [studentCode]
    );

    if (students.length === 0) return null;

    return students[0].student_id;
}

async function findCourseId(courseCode) {
    const [courses] = await db.query(
        `SELECT course_id
     FROM courses
     WHERE course_code = ?
     LIMIT 1`,
        [courseCode]
    );

    if (courses.length === 0) return null;

    return courses[0].course_id;
}

export async function getEnrollments(req, res) {
    try {
        const [enrollments] = await db.query(
            `SELECT
        e.enrollment_id AS id,
        e.student_id AS studentId,
        e.course_id AS courseId,
        e.enrollment_date AS enrollmentDate,
        e.status,
        s.student_code AS studentCode,
        CONCAT(s.first_name, ' ', s.last_name) AS studentName,
        c.course_code AS courseCode,
        c.course_name AS courseName,
        d.department_name AS department
      FROM enrollments e
      INNER JOIN students s ON e.student_id = s.student_id
      INNER JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN departments d ON c.department_id = d.department_id
      ORDER BY e.enrollment_id DESC`
        );

        const formattedEnrollments = enrollments.map((enrollment) => ({
            ...enrollment,
            enrollmentDate: formatDate(enrollment.enrollmentDate),
            status: formatStatus(enrollment.status),
            department: enrollment.department || "No Department",
        }));

        res.json({
            success: true,
            data: formattedEnrollments,
        });
    } catch (error) {
        console.error("Get enrollments error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
            error: error.message,
        });
    }
}

export async function createEnrollment(req, res) {
    try {
        const { studentCode, courseCode, enrollmentDate, status } = req.body;

        if (!studentCode || !courseCode) {
            return res.status(400).json({
                success: false,
                message: "Student code and course code are required.",
            });
        }

        const studentId = await findStudentId(studentCode);

        if (!studentId) {
            return res.status(404).json({
                success: false,
                message: "Student not found. Please select a valid student.",
            });
        }

        const courseId = await findCourseId(courseCode);

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "Course not found. Please select a valid course.",
            });
        }

        const [existing] = await db.query(
            `SELECT enrollment_id
       FROM enrollments
       WHERE student_id = ?
         AND course_id = ?
       LIMIT 1`,
            [studentId, courseId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This student is already enrolled in this course.",
            });
        }

        const [result] = await db.query(
            `INSERT INTO enrollments
        (
          student_id,
          course_id,
          enrollment_date,
          status
        )
       VALUES (?, ?, COALESCE(?, CURDATE()), ?)`,
            [studentId, courseId, enrollmentDate || null, toDbStatus(status)]
        );

        res.status(201).json({
            success: true,
            message: "Enrollment created successfully",
            data: {
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error("Create enrollment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create enrollment",
            error: error.message,
        });
    }
}

export async function updateEnrollment(req, res) {
    try {
        const { id } = req.params;
        const { studentCode, courseCode, enrollmentDate, status } = req.body;

        if (!studentCode || !courseCode) {
            return res.status(400).json({
                success: false,
                message: "Student code and course code are required.",
            });
        }

        const studentId = await findStudentId(studentCode);

        if (!studentId) {
            return res.status(404).json({
                success: false,
                message: "Student not found. Please select a valid student.",
            });
        }

        const courseId = await findCourseId(courseCode);

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "Course not found. Please select a valid course.",
            });
        }

        const [duplicate] = await db.query(
            `SELECT enrollment_id
       FROM enrollments
       WHERE student_id = ?
         AND course_id = ?
         AND enrollment_id <> ?
       LIMIT 1`,
            [studentId, courseId, id]
        );

        if (duplicate.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Another enrollment already exists for this student and course.",
            });
        }

        const [result] = await db.query(
            `UPDATE enrollments
       SET
        student_id = ?,
        course_id = ?,
        enrollment_date = COALESCE(?, CURDATE()),
        status = ?
       WHERE enrollment_id = ?`,
            [studentId, courseId, enrollmentDate || null, toDbStatus(status), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found.",
            });
        }

        res.json({
            success: true,
            message: "Enrollment updated successfully",
        });
    } catch (error) {
        console.error("Update enrollment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update enrollment",
            error: error.message,
        });
    }
}

export async function deleteEnrollment(req, res) {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM enrollments WHERE enrollment_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found.",
            });
        }

        res.json({
            success: true,
            message: "Enrollment deleted successfully",
        });
    } catch (error) {
        console.error("Delete enrollment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete enrollment",
            error: error.message,
        });
    }
}