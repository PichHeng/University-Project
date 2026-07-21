import db from "../config/db.js";

export async function getAssignments(req, res) {
    try {
        const params = [];
        let scope = "";
        if (req.user.role === "teacher") { scope = "AND t.user_id = ?"; params.push(req.user.user_id); }
        if (req.user.role === "student") { scope = "AND s.user_id = ?"; params.push(req.user.user_id); }

        const [rows] = await db.query(
            `SELECT DISTINCT a.assignment_id AS assignmentId, a.course_id AS courseId,
                    a.teacher_id AS teacherId, a.title, a.description,
                    a.due_date AS dueDate, a.max_score AS maxScore, a.status,
                    c.course_code AS courseCode, c.course_name AS courseName,
                    CONCAT(t.first_name, ' ', t.last_name) AS teacherName
             FROM assignments a
             JOIN courses c ON c.course_id = a.course_id
             JOIN teachers t ON t.teacher_id = a.teacher_id
             LEFT JOIN enrollments e ON e.course_id = c.course_id
             LEFT JOIN students s ON s.student_id = e.student_id
             WHERE 1 = 1 ${scope}
             ORDER BY a.due_date DESC, a.assignment_id DESC`,
            params
        );
        return res.json({ success: true, message: "Assignments loaded successfully", data: rows });
    } catch (error) {
        console.error("Get assignments error:", error);
        return res.status(500).json({ success: false, message: "Failed to load assignments" });
    }
}

async function resolveTeacher(req, courseId, requestedTeacherId) {
    const params = [courseId];
    let scope = "";
    if (req.user.role === "teacher") { scope = "AND t.user_id = ?"; params.push(req.user.user_id); }
    const [courses] = await db.query(
        `SELECT c.teacher_id AS teacherId FROM courses c
         LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
         WHERE c.course_id = ? ${scope} LIMIT 1`, params
    );
    if (!courses.length) return null;
    return req.user.role === "admin" ? Number(requestedTeacherId || courses[0].teacherId) : courses[0].teacherId;
}

export async function createAssignment(req, res) {
    const { courseId, teacherId, title, description = null, dueDate = null, maxScore = 100, status = "active" } = req.body;
    if (!courseId || !title?.trim() || !["active", "closed"].includes(status) || Number(maxScore) <= 0) {
        return res.status(400).json({ success: false, message: "Course, title, positive max score, and valid status are required." });
    }
    try {
        const ownerId = await resolveTeacher(req, courseId, teacherId);
        if (!ownerId) return res.status(403).json({ success: false, message: "You cannot create an assignment for this course." });
        const [result] = await db.query(
            `INSERT INTO assignments (course_id, teacher_id, title, description, due_date, max_score, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [courseId, ownerId, title.trim(), description, dueDate || null, maxScore, status]
        );
        return res.status(201).json({ success: true, message: "Assignment created successfully", data: { assignmentId: result.insertId } });
    } catch (error) {
        console.error("Create assignment error:", error);
        return res.status(500).json({ success: false, message: "Failed to create assignment" });
    }
}

export async function updateAssignment(req, res) {
    const { id } = req.params;
    const { title, description = null, dueDate = null, maxScore = 100, status = "active" } = req.body;
    if (!title?.trim() || !["active", "closed"].includes(status) || Number(maxScore) <= 0) {
        return res.status(400).json({ success: false, message: "Title, positive max score, and valid status are required." });
    }
    try {
        const params = [title.trim(), description, dueDate || null, maxScore, status, id];
        let scope = "";
        if (req.user.role === "teacher") { scope = "AND teacher_id = (SELECT teacher_id FROM teachers WHERE user_id = ?)"; params.push(req.user.user_id); }
        const [result] = await db.query(
            `UPDATE assignments SET title = ?, description = ?, due_date = ?, max_score = ?, status = ?
             WHERE assignment_id = ? ${scope}`, params
        );
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Assignment not found or not permitted." });
        return res.json({ success: true, message: "Assignment updated successfully" });
    } catch (error) {
        console.error("Update assignment error:", error);
        return res.status(500).json({ success: false, message: "Failed to update assignment" });
    }
}

export async function deleteAssignment(req, res) {
    try {
        const params = [req.params.id];
        let scope = "";
        if (req.user.role === "teacher") { scope = "AND teacher_id = (SELECT teacher_id FROM teachers WHERE user_id = ?)"; params.push(req.user.user_id); }
        const [result] = await db.query(`DELETE FROM assignments WHERE assignment_id = ? ${scope}`, params);
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Assignment not found or not permitted." });
        return res.json({ success: true, message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Delete assignment error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete assignment" });
    }
}
