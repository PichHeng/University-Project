import db from "../config/db.js";

export async function getAssignments(req, res) {
    try {
        const params = [];
        let scope = "";
        if (req.user.role === "teacher") {
            scope = `AND c.teacher_id = t.teacher_id
                     AND t.user_id = ?`;
            params.push(req.user.user_id);
        }

        const [rows] = await db.query(
            `SELECT a.assignment_id AS assignmentId, a.course_id AS courseId,
                    a.teacher_id AS teacherId, a.title, a.description,
                    DATE_FORMAT(a.due_date, '%Y-%m-%d') AS dueDate,
                    a.max_score AS maxScore, a.status,
                    c.course_code AS courseCode, c.course_name AS courseName,
                    CONCAT(t.first_name, ' ', t.last_name) AS teacherName,
                    COUNT(DISTINCT s.student_id) AS total_students,
                    COUNT(DISTINCT sub.submission_id) AS submitted_count,
                    COUNT(DISTINCT CASE WHEN sub.is_late = 1 THEN sub.submission_id END) AS late_count,
                    COUNT(DISTINCT CASE WHEN sub.status = 'reviewed' THEN sub.submission_id END) AS reviewed_count
             FROM assignments a
             JOIN courses c ON c.course_id = a.course_id
             JOIN teachers t ON t.teacher_id = a.teacher_id
             LEFT JOIN enrollments e
                ON e.course_id = a.course_id AND e.status = 'active'
             LEFT JOIN students s
                ON s.student_id = e.student_id AND s.status = 'active'
             LEFT JOIN assignment_submissions sub
                ON sub.assignment_id = a.assignment_id
                AND sub.student_id = s.student_id
             WHERE 1 = 1 ${scope}
             GROUP BY
                a.assignment_id, a.course_id, a.teacher_id, a.title, a.description,
                a.due_date, a.max_score, a.status, c.course_code, c.course_name,
                t.first_name, t.last_name
             ORDER BY a.due_date ASC, a.assignment_id DESC`,
            params
        );
        return res.json({ success: true, message: "Assignments loaded successfully", data: rows });
    } catch (error) {
        console.error("Get assignments error:", error);
        return res.status(500).json({ success: false, message: "Failed to load assignments" });
    }
}

function readAssignmentBody(body) {
    return {
        courseId: body.course_id ?? body.courseId,
        teacherId: body.teacher_id ?? body.teacherId,
        title: body.title,
        description: body.description ?? null,
        dueDate: body.due_date ?? body.dueDate ?? null,
        maxScore: body.max_score ?? body.maxScore ?? 100,
        status: String(body.status ?? "active").toLowerCase(),
    };
}

function validateAssignmentInput(input, { requireCourse = true } = {}) {
    const courseId = Number(input.courseId);
    const maxScore = Number(input.maxScore);
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const dueDate = input.dueDate ? String(input.dueDate).slice(0, 10) : null;

    if (requireCourse && (!Number.isInteger(courseId) || courseId <= 0)) {
        return { error: "A valid course is required." };
    }
    if (!title) return { error: "Assignment title is required." };
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/u.test(dueDate)) {
        return { error: "Due date must use YYYY-MM-DD format." };
    }
    if (!Number.isFinite(maxScore) || maxScore <= 0) {
        return { error: "Max score must be a positive number." };
    }
    if (!["active", "closed"].includes(input.status)) {
        return { error: "Status must be active or closed." };
    }

    return { courseId, maxScore, title, dueDate };
}

async function resolveAssignmentTeacher(req, courseId, requestedTeacherId) {
    if (req.user.role === "teacher") {
        const [teachers] = await db.query(
            `SELECT teacher_id
             FROM teachers
             WHERE user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );

        if (!teachers.length) {
            return { errorStatus: 403, error: "Teacher profile not found." };
        }

        const teacherId = teachers[0].teacher_id;
        const [ownedCourses] = await db.query(
            `SELECT course_id
             FROM courses
             WHERE course_id = ? AND teacher_id = ?
             LIMIT 1`,
            [courseId, teacherId]
        );

        if (!ownedCourses.length) {
            return {
                errorStatus: 403,
                error: "You can only create assignments for your own courses.",
            };
        }

        return { teacherId };
    }

    const [courses] = await db.query(
        `SELECT teacher_id
         FROM courses
         WHERE course_id = ?
         LIMIT 1`,
        [courseId]
    );
    if (!courses.length) return { errorStatus: 404, error: "Course not found." };

    const teacherId = Number(requestedTeacherId ?? courses[0].teacher_id);
    if (!Number.isInteger(teacherId) || teacherId <= 0) {
        return { errorStatus: 400, error: "A valid teacher is required." };
    }

    const [teachers] = await db.query(
        "SELECT teacher_id FROM teachers WHERE teacher_id = ? LIMIT 1",
        [teacherId]
    );
    if (!teachers.length) return { errorStatus: 400, error: "Teacher not found." };

    return { teacherId };
}

export async function createAssignment(req, res) {
    const input = readAssignmentBody(req.body);
    const validated = validateAssignmentInput(input);
    if (validated.error) {
        return res.status(400).json({ success: false, message: validated.error });
    }

    try {
        const owner = await resolveAssignmentTeacher(
            req,
            validated.courseId,
            input.teacherId
        );
        if (owner.error) {
            return res.status(owner.errorStatus).json({ success: false, message: owner.error });
        }

        const [result] = await db.query(
            `INSERT INTO assignments (course_id, teacher_id, title, description, due_date, max_score, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                validated.courseId,
                owner.teacherId,
                validated.title,
                input.description || null,
                validated.dueDate,
                validated.maxScore,
                input.status,
            ]
        );
        return res.status(201).json({ success: true, message: "Assignment created successfully", data: { assignmentId: result.insertId } });
    } catch (error) {
        console.error("Create assignment error:", error);
        return res.status(500).json({ success: false, message: "Failed to create assignment" });
    }
}

export async function updateAssignment(req, res) {
    const { id } = req.params;
    const input = readAssignmentBody(req.body);
    const validated = validateAssignmentInput(input);
    if (validated.error) {
        return res.status(400).json({ success: false, message: validated.error });
    }

    try {
        const assignmentId = Number(id);
        if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
            return res.status(400).json({ success: false, message: "Invalid assignment ID." });
        }

        const params = [assignmentId];
        let scope = "";
        if (req.user.role === "teacher") {
            scope = "AND a.teacher_id = (SELECT teacher_id FROM teachers WHERE user_id = ?)";
            params.push(req.user.user_id);
        }
        const [assignments] = await db.query(
            `SELECT a.teacher_id AS teacherId
             FROM assignments a
             WHERE a.assignment_id = ? ${scope}
             LIMIT 1`,
            params
        );
        if (!assignments.length) {
            return res.status(404).json({ success: false, message: "Assignment not found or not permitted." });
        }

        const owner = await resolveAssignmentTeacher(
            req,
            validated.courseId,
            input.teacherId ?? assignments[0].teacherId
        );
        if (owner.error) {
            return res.status(owner.errorStatus).json({ success: false, message: owner.error });
        }

        const [result] = await db.query(
            `UPDATE assignments
             SET course_id = ?, teacher_id = ?, title = ?, description = ?, due_date = ?,
                 max_score = ?, status = ?
             WHERE assignment_id = ?`,
            [
                validated.courseId,
                owner.teacherId,
                validated.title,
                input.description || null,
                validated.dueDate,
                validated.maxScore,
                input.status,
                assignmentId,
            ]
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

export async function getMyStudentAssignments(req, res) {
    try {
        console.log(
            "Student assignment request user:",
            req.user.username,
            req.user.role
        );

        const [students] = await db.query(
            `SELECT student_id
             FROM students
             WHERE user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );

        if (!students.length) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found.",
            });
        }

        const [rows] = await db.query(
            `SELECT
                a.assignment_id,
                a.title,
                a.description,
                DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date,
                a.max_score,
                a.status,
                c.course_id,
                c.course_code,
                c.course_name,
                t.teacher_code,
                CONCAT(t.first_name, ' ', t.last_name) AS teacher_name
             FROM assignments a
             INNER JOIN courses c ON c.course_id = a.course_id
             INNER JOIN enrollments e ON e.course_id = c.course_id
             LEFT JOIN teachers t ON t.teacher_id = a.teacher_id
             WHERE e.student_id = ?
               AND e.status = 'active'
               AND a.status = 'active'
             ORDER BY a.due_date ASC, c.course_code ASC`,
            [students[0].student_id]
        );

        console.log("Student assignment count:", rows.length);

        return res.json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error("Get student assignments error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student assignments.",
        });
    }
}
