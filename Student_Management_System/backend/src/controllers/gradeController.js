import db from "../config/db.js";

function letterFor(score) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
}

function validScore(value) {
    const score = Number(value);
    return Number.isFinite(score) && score >= 0 && score <= 100;
}

export async function getGrades(req, res) {
    try {
        const params = [];
        let scope = "";
        if (req.user.role === "teacher") { scope = "AND t.user_id = ?"; params.push(req.user.user_id); }
        if (req.user.role === "student") { scope = "AND s.user_id = ?"; params.push(req.user.user_id); }

        const [rows] = await db.query(
            `SELECT g.grade_id AS gradeId, g.enrollment_id AS enrollmentId,
                    g.assignment_score AS assignmentScore, g.midterm_score AS midtermScore,
                    g.final_score AS finalScore, g.total_score AS totalScore,
                    g.grade_letter AS gradeLetter, g.remark,
                    s.student_code AS studentCode,
                    CONCAT(s.first_name, ' ', s.last_name) AS studentName,
                    c.course_id AS courseId, c.course_code AS courseCode, c.course_name AS courseName
             FROM grades g
             JOIN enrollments e ON e.enrollment_id = g.enrollment_id
             JOIN students s ON s.student_id = e.student_id
             JOIN courses c ON c.course_id = e.course_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE 1 = 1 ${scope}
             ORDER BY c.course_code, s.first_name, s.last_name`,
            params
        );

        return res.json({ success: true, message: "Grades loaded successfully", data: rows });
    } catch (error) {
        console.error("Get grades error:", error);
        return res.status(500).json({ success: false, message: "Failed to load grades" });
    }
}

export async function saveGrade(req, res) {
    const { enrollmentId, assignmentScore, midtermScore, finalScore, remark = null } = req.body;
    if (!enrollmentId || ![assignmentScore, midtermScore, finalScore].every(validScore)) {
        return res.status(400).json({ success: false, message: "Enrollment and scores between 0 and 100 are required." });
    }

    try {
        const params = [enrollmentId];
        let roleCheck = "";
        if (req.user.role === "teacher") { roleCheck = "AND t.user_id = ?"; params.push(req.user.user_id); }
        const [allowed] = await db.query(
            `SELECT e.enrollment_id FROM enrollments e
             JOIN courses c ON c.course_id = e.course_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE e.enrollment_id = ? ${roleCheck} LIMIT 1`, params
        );
        if (allowed.length === 0) return res.status(403).json({ success: false, message: "You cannot update this enrollment." });

        const totalScore = Number(((Number(assignmentScore) + Number(midtermScore) + Number(finalScore)) / 3).toFixed(2));
        const gradeLetter = letterFor(totalScore);
        await db.query(
            `INSERT INTO grades (enrollment_id, assignment_score, midterm_score, final_score, total_score, grade_letter, remark)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE assignment_score = VALUES(assignment_score), midterm_score = VALUES(midterm_score),
                 final_score = VALUES(final_score), total_score = VALUES(total_score), grade_letter = VALUES(grade_letter), remark = VALUES(remark)`,
            [enrollmentId, assignmentScore, midtermScore, finalScore, totalScore, gradeLetter, remark]
        );
        return res.json({ success: true, message: "Grade saved successfully", data: { totalScore, gradeLetter } });
    } catch (error) {
        console.error("Save grade error:", error);
        return res.status(500).json({ success: false, message: "Failed to save grade" });
    }
}
