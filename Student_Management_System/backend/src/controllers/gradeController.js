import db from "../config/db.js";

const scoreRules = [
    { field: "assignment_score", legacyField: "assignmentScore", label: "Assignment score", max: 30 },
    { field: "midterm_score", legacyField: "midtermScore", label: "Midterm score", max: 30 },
    { field: "final_score", legacyField: "finalScore", label: "Final score", max: 40 },
];

export function calculateGradeLetter(totalScore) {
    if (totalScore >= 90) return "A";
    if (totalScore >= 80) return "B";
    if (totalScore >= 70) return "C";
    if (totalScore >= 60) return "D";
    return "F";
}

function validateGradeInput(input) {
    const enrollmentId = Number(input?.enrollment_id ?? input?.enrollmentId);
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
        return { error: "A valid enrollment_id is required." };
    }

    const scores = {};
    for (const rule of scoreRules) {
        const rawValue = input?.[rule.field] ?? input?.[rule.legacyField];
        const score = Number(rawValue);
        if (
            rawValue === "" ||
            rawValue === null ||
            rawValue === undefined ||
            !Number.isFinite(score) ||
            score < 0 ||
            score > rule.max
        ) {
            return { error: `${rule.label} must be a number between 0 and ${rule.max}.` };
        }
        scores[rule.field] = Number(score.toFixed(2));
    }

    if (input.remark !== null && input.remark !== undefined && typeof input.remark !== "string") {
        return { error: "Remark must be text." };
    }

    const totalScore = Number((
        scores.assignment_score + scores.midterm_score + scores.final_score
    ).toFixed(2));

    return {
        enrollmentId,
        ...scores,
        totalScore,
        gradeLetter: calculateGradeLetter(totalScore),
        remark: input.remark?.trim() || null,
    };
}

async function findTeacherId(executor, userId) {
    const [teachers] = await executor.query(
        `SELECT teacher_id
         FROM teachers
         WHERE user_id = ?
         LIMIT 1`,
        [userId]
    );
    return teachers[0]?.teacher_id ?? null;
}

async function saveGradeRecord(executor, grade) {
    await executor.query(
        `INSERT INTO grades
            (enrollment_id, assignment_score, midterm_score, final_score,
             total_score, grade_letter, remark)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
             assignment_score = VALUES(assignment_score),
             midterm_score = VALUES(midterm_score),
             final_score = VALUES(final_score),
             total_score = VALUES(total_score),
             grade_letter = VALUES(grade_letter),
             remark = VALUES(remark)`,
        [
            grade.enrollmentId,
            grade.assignment_score,
            grade.midterm_score,
            grade.final_score,
            grade.totalScore,
            grade.gradeLetter,
            grade.remark,
        ]
    );

    const [savedGrades] = await executor.query(
        `SELECT grade_id, enrollment_id, assignment_score, midterm_score,
                final_score, total_score, grade_letter, remark, created_at, updated_at
         FROM grades
         WHERE enrollment_id = ?
         LIMIT 1`,
        [grade.enrollmentId]
    );
    return savedGrades[0];
}

export async function getTeacherGradeCourses(req, res) {
    try {
        const teacherId = await findTeacherId(db, req.user.user_id);
        if (!teacherId) {
            return res.status(404).json({ success: false, message: "Teacher profile not found." });
        }

        const [courses] = await db.query(
            `SELECT c.course_id, c.course_code, c.course_name, c.semester, c.credit,
                    c.status, d.department_code, d.department_name,
                    COUNT(e.enrollment_id) AS student_count,
                    COUNT(g.grade_id) AS grade_count
             FROM courses c
             LEFT JOIN departments d ON d.department_id = c.department_id
             LEFT JOIN enrollments e
                    ON e.course_id = c.course_id AND e.status = 'active'
             LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
             WHERE c.teacher_id = ?
             GROUP BY c.course_id, c.course_code, c.course_name, c.semester, c.credit,
                      c.status, d.department_code, d.department_name
             ORDER BY c.course_code ASC`,
            [teacherId]
        );

        return res.json({ success: true, data: courses });
    } catch (error) {
        console.error("Get teacher grade courses error:", error);
        return res.status(500).json({ success: false, message: "Failed to load teacher courses." });
    }
}

export async function getTeacherCourseStudents(req, res) {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    try {
        const teacherId = await findTeacherId(db, req.user.user_id);
        if (!teacherId) {
            return res.status(404).json({ success: false, message: "Teacher profile not found." });
        }

        const [ownedCourses] = await db.query(
            `SELECT course_id
             FROM courses
             WHERE course_id = ? AND teacher_id = ?
             LIMIT 1`,
            [courseId, teacherId]
        );
        if (!ownedCourses.length) {
            return res.status(403).json({
                success: false,
                message: "You can only view students from your own courses.",
            });
        }

        const [students] = await db.query(
            `SELECT e.enrollment_id, s.student_id, s.student_code,
                    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
                    s.gender, c.course_id, c.course_code, c.course_name,
                    g.grade_id,
                    COALESCE(g.assignment_score, 0) AS assignment_score,
                    COALESCE(g.midterm_score, 0) AS midterm_score,
                    COALESCE(g.final_score, 0) AS final_score,
                    COALESCE(g.total_score, 0) AS total_score,
                    g.grade_letter, g.remark
             FROM enrollments e
             INNER JOIN students s ON s.student_id = e.student_id
             INNER JOIN courses c ON c.course_id = e.course_id
             LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
             WHERE e.course_id = ? AND e.status = 'active' AND c.teacher_id = ?
             ORDER BY s.student_code ASC`,
            [courseId, teacherId]
        );

        return res.json({ success: true, data: students });
    } catch (error) {
        console.error("Get teacher course students error:", error);
        return res.status(500).json({ success: false, message: "Failed to load enrolled students." });
    }
}

export async function saveTeacherGrade(req, res) {
    const grade = validateGradeInput(req.body);
    if (grade.error) {
        return res.status(400).json({ success: false, message: grade.error });
    }

    try {
        const teacherId = await findTeacherId(db, req.user.user_id);
        if (!teacherId) {
            return res.status(404).json({ success: false, message: "Teacher profile not found." });
        }

        const [enrollments] = await db.query(
            `SELECT e.enrollment_id, c.teacher_id
             FROM enrollments e
             INNER JOIN courses c ON c.course_id = e.course_id
             WHERE e.enrollment_id = ? AND e.status = 'active'
             LIMIT 1`,
            [grade.enrollmentId]
        );
        if (!enrollments.length) {
            return res.status(404).json({ success: false, message: "Active enrollment not found." });
        }
        if (Number(enrollments[0].teacher_id) !== Number(teacherId)) {
            return res.status(403).json({
                success: false,
                message: "You can only grade enrollments from your own courses.",
            });
        }

        const savedGrade = await saveGradeRecord(db, grade);
        return res.json({ success: true, message: "Grade saved successfully", data: savedGrade });
    } catch (error) {
        console.error("Save teacher grade error:", error);
        return res.status(500).json({ success: false, message: "Failed to save grade." });
    }
}

export async function saveTeacherGradesBulk(req, res) {
    if (!Array.isArray(req.body?.grades) || !req.body.grades.length) {
        return res.status(400).json({
            success: false,
            message: "Provide at least one grade to save.",
        });
    }

    const grades = [];
    const enrollmentIds = new Set();
    for (const input of req.body.grades) {
        const grade = validateGradeInput(input);
        if (grade.error) {
            return res.status(400).json({ success: false, message: grade.error });
        }
        if (enrollmentIds.has(grade.enrollmentId)) {
            return res.status(400).json({
                success: false,
                message: `Enrollment ${grade.enrollmentId} appears more than once.`,
            });
        }
        enrollmentIds.add(grade.enrollmentId);
        grades.push(grade);
    }

    let connection;
    let transactionStarted = false;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        transactionStarted = true;

        const teacherId = await findTeacherId(connection, req.user.user_id);
        if (!teacherId) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(404).json({ success: false, message: "Teacher profile not found." });
        }

        const placeholders = grades.map(() => "?").join(", ");
        const [allowedEnrollments] = await connection.query(
            `SELECT e.enrollment_id
             FROM enrollments e
             INNER JOIN courses c ON c.course_id = e.course_id
             WHERE e.enrollment_id IN (${placeholders})
               AND e.status = 'active'
               AND c.teacher_id = ?
             FOR UPDATE`,
            [...enrollmentIds, teacherId]
        );
        const allowedIds = new Set(allowedEnrollments.map((row) => Number(row.enrollment_id)));
        if (grades.some((grade) => !allowedIds.has(grade.enrollmentId))) {
            await connection.rollback();
            transactionStarted = false;
            return res.status(403).json({
                success: false,
                message: "Every enrollment must belong to one of your active course enrollments.",
            });
        }

        for (const grade of grades) {
            await saveGradeRecord(connection, grade);
        }

        await connection.commit();
        transactionStarted = false;
        return res.json({
            success: true,
            message: "Grades saved successfully",
            data: { saved_count: grades.length },
        });
    } catch (error) {
        if (connection && transactionStarted) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Bulk grade rollback error:", rollbackError);
            }
        }
        console.error("Bulk save teacher grades error:", error);
        return res.status(500).json({ success: false, message: "Failed to save grades." });
    } finally {
        connection?.release();
    }
}

export async function getMyStudentGrades(req, res) {
    try {
        const [students] = await db.query(
            `SELECT student_id
             FROM students
             WHERE user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );
        if (!students.length) {
            return res.status(404).json({ success: false, message: "Student profile not found." });
        }

        const [grades] = await db.query(
            `SELECT s.student_code,
                    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
                    c.course_code, c.course_name,
                    CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
                    c.semester, g.assignment_score, g.midterm_score, g.final_score,
                    g.total_score, g.grade_letter, g.remark
             FROM grades g
             INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
             INNER JOIN students s ON s.student_id = e.student_id
             INNER JOIN courses c ON c.course_id = e.course_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE s.student_id = ?
             ORDER BY c.course_code ASC`,
            [students[0].student_id]
        );

        return res.json({ success: true, data: grades });
    } catch (error) {
        console.error("Get student grades error:", error);
        return res.status(500).json({ success: false, message: "Failed to load grades." });
    }
}

export async function getGrades(req, res) {
    try {
        const [grades] = await db.query(
            `SELECT g.grade_id AS gradeId, g.enrollment_id AS enrollmentId,
                    g.assignment_score AS assignmentScore,
                    g.midterm_score AS midtermScore,
                    g.final_score AS finalScore,
                    g.total_score AS totalScore,
                    g.grade_letter AS gradeLetter, g.remark,
                    s.student_code AS studentCode,
                    CONCAT(s.first_name, ' ', s.last_name) AS studentName,
                    c.course_id AS courseId, c.course_code AS courseCode,
                    c.course_name AS courseName
             FROM grades g
             INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
             INNER JOIN students s ON s.student_id = e.student_id
             INNER JOIN courses c ON c.course_id = e.course_id
             ORDER BY c.course_code ASC, s.student_code ASC`
        );
        return res.json({ success: true, message: "Grades loaded successfully", data: grades });
    } catch (error) {
        console.error("Get admin grades error:", error);
        return res.status(500).json({ success: false, message: "Failed to load grades." });
    }
}

export async function saveGrade(req, res) {
    const grade = validateGradeInput(req.body);
    if (grade.error) {
        return res.status(400).json({ success: false, message: grade.error });
    }

    try {
        const [enrollments] = await db.query(
            "SELECT enrollment_id FROM enrollments WHERE enrollment_id = ? LIMIT 1",
            [grade.enrollmentId]
        );
        if (!enrollments.length) {
            return res.status(404).json({ success: false, message: "Enrollment not found." });
        }

        const savedGrade = await saveGradeRecord(db, grade);
        return res.json({ success: true, message: "Grade saved successfully", data: savedGrade });
    } catch (error) {
        console.error("Save admin grade error:", error);
        return res.status(500).json({ success: false, message: "Failed to save grade." });
    }
}
