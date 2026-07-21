import db from "../config/db.js";

const validStatuses = new Set(["present", "absent", "late"]);

function scopeFor(user) {
    if (user.role === "teacher") return { sql: "AND t.user_id = ?", params: [user.user_id] };
    if (user.role === "student") return { sql: "AND s.user_id = ?", params: [user.user_id] };
    return { sql: "", params: [] };
}

export async function getAttendance(req, res) {
    try {
        const scope = scopeFor(req.user);
        const [rows] = await db.query(
            `SELECT a.attendance_id AS attendanceId,
                    a.enrollment_id AS enrollmentId,
                    a.attendance_date AS attendanceDate,
                    a.status,
                    a.remark,
                    s.student_id AS studentId,
                    s.student_code AS studentCode,
                    CONCAT(s.first_name, ' ', s.last_name) AS studentName,
                    c.course_id AS courseId,
                    c.course_code AS courseCode,
                    c.course_name AS courseName
             FROM attendance a
             JOIN enrollments e ON e.enrollment_id = a.enrollment_id
             JOIN students s ON s.student_id = e.student_id
             JOIN courses c ON c.course_id = e.course_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE 1 = 1 ${scope.sql}
             ORDER BY a.attendance_date DESC, s.first_name, s.last_name`,
            scope.params
        );

        return res.json({ success: true, message: "Attendance loaded successfully", data: rows });
    } catch (error) {
        console.error("Get attendance error:", error);
        return res.status(500).json({ success: false, message: "Failed to load attendance" });
    }
}

export async function saveAttendance(req, res) {
    const { enrollmentId, attendanceDate, status, remark = null } = req.body;

    if (!enrollmentId || !attendanceDate || !validStatuses.has(status)) {
        return res.status(400).json({ success: false, message: "Enrollment, date, and a valid status are required." });
    }

    try {
        const params = [enrollmentId];
        let roleCheck = "";
        if (req.user.role === "teacher") {
            roleCheck = "AND t.user_id = ?";
            params.push(req.user.user_id);
        }

        const [allowed] = await db.query(
            `SELECT e.enrollment_id
             FROM enrollments e
             JOIN courses c ON c.course_id = e.course_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE e.enrollment_id = ? ${roleCheck}
             LIMIT 1`,
            params
        );

        if (allowed.length === 0) {
            return res.status(403).json({ success: false, message: "You cannot update this enrollment." });
        }

        await db.query(
            `INSERT INTO attendance (enrollment_id, attendance_date, status, remark)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), remark = VALUES(remark)`,
            [enrollmentId, attendanceDate, status, remark]
        );

        return res.json({ success: true, message: "Attendance saved successfully" });
    } catch (error) {
        console.error("Save attendance error:", error);
        return res.status(500).json({ success: false, message: "Failed to save attendance" });
    }
}
