import db from "../config/db.js";

function numberCounts(row) {
    return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, Number(value)])
    );
}

export async function getAdminDashboard(req, res) {
    try {
        const [[countRows], [recentStudents], [recentAssignments]] = await Promise.all([
            db.query(
                `SELECT
                    (SELECT COUNT(*) FROM students) AS totalStudents,
                    (SELECT COUNT(*) FROM teachers) AS totalTeachers,
                    (SELECT COUNT(*) FROM departments) AS totalDepartments,
                    (SELECT COUNT(*) FROM courses) AS totalCourses,
                    (SELECT COUNT(*) FROM enrollments) AS totalEnrollments,
                    (SELECT COUNT(*) FROM assignments) AS totalAssignments,
                    (SELECT COUNT(*) FROM grades) AS totalGrades`
            ),
            db.query(
                `SELECT s.student_code, CONCAT(s.first_name, ' ', s.last_name) AS full_name,
                        s.gender, d.department_name, s.status
                 FROM students s
                 LEFT JOIN departments d ON d.department_id = s.department_id
                 ORDER BY s.student_code ASC
                 LIMIT 5`
            ),
            db.query(
                `SELECT a.title, c.course_code, c.course_name,
                        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date, a.status
                 FROM assignments a
                 INNER JOIN courses c ON c.course_id = a.course_id
                 ORDER BY a.due_date ASC, a.assignment_id DESC
                 LIMIT 5`
            ),
        ]);

        return res.json({
            success: true,
            data: {
                ...numberCounts(countRows[0]),
                recentStudents,
                recentAssignments,
            },
        });
    } catch (error) {
        console.error("Get admin dashboard error:", error);
        return res.status(500).json({ success: false, message: "Failed to load admin dashboard." });
    }
}

export async function getAdminReports(req, res) {
    try {
        const [
            [summaryRows],
            [studentsByDepartment],
            [teachersByDepartment],
            [coursesByDepartment],
            [enrollmentsByCourse],
            [gradesSummaryByCourse],
            [recentGrades],
            [recentAssignments],
        ] = await Promise.all([
            db.query(
                `SELECT
                    (SELECT COUNT(*) FROM students) AS totalStudents,
                    (SELECT COUNT(*) FROM teachers) AS totalTeachers,
                    (SELECT COUNT(*) FROM departments) AS totalDepartments,
                    (SELECT COUNT(*) FROM courses) AS totalCourses,
                    (SELECT COUNT(*) FROM enrollments) AS totalEnrollments,
                    (SELECT COUNT(*) FROM assignments) AS totalAssignments,
                    (SELECT COUNT(*) FROM grades) AS totalGrades`
            ),
            db.query(
                `SELECT d.department_code, d.department_name,
                        COUNT(s.student_id) AS student_count
                 FROM departments d
                 LEFT JOIN students s ON s.department_id = d.department_id
                 GROUP BY d.department_id, d.department_code, d.department_name
                 ORDER BY d.department_code ASC`
            ),
            db.query(
                `SELECT d.department_code, d.department_name,
                        COUNT(t.teacher_id) AS teacher_count
                 FROM departments d
                 LEFT JOIN teachers t ON t.department_id = d.department_id
                 GROUP BY d.department_id, d.department_code, d.department_name
                 ORDER BY d.department_code ASC`
            ),
            db.query(
                `SELECT d.department_code, d.department_name,
                        COUNT(c.course_id) AS course_count
                 FROM departments d
                 LEFT JOIN courses c ON c.department_id = d.department_id
                 GROUP BY d.department_id, d.department_code, d.department_name
                 ORDER BY d.department_code ASC`
            ),
            db.query(
                `SELECT c.course_code, c.course_name,
                        CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
                        COUNT(e.enrollment_id) AS enrollment_count
                 FROM courses c
                 LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
                 LEFT JOIN enrollments e ON e.course_id = c.course_id
                 GROUP BY c.course_id, c.course_code, c.course_name,
                          t.first_name, t.last_name
                 ORDER BY c.course_code ASC`
            ),
            db.query(
                `SELECT c.course_code, c.course_name,
                        COUNT(g.grade_id) AS graded_students,
                        ROUND(AVG(g.total_score), 2) AS average_score,
                        MAX(g.total_score) AS highest_score,
                        MIN(g.total_score) AS lowest_score
                 FROM courses c
                 LEFT JOIN enrollments e ON e.course_id = c.course_id
                 LEFT JOIN grades g ON g.enrollment_id = e.enrollment_id
                 GROUP BY c.course_id, c.course_code, c.course_name
                 ORDER BY c.course_code ASC`
            ),
            db.query(
                `SELECT s.student_code,
                        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                        c.course_code, c.course_name, g.total_score,
                        g.grade_letter, g.remark
                 FROM grades g
                 INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                 INNER JOIN students s ON s.student_id = e.student_id
                 INNER JOIN courses c ON c.course_id = e.course_id
                 ORDER BY g.updated_at DESC
                 LIMIT 10`
            ),
            db.query(
                `SELECT a.title, c.course_code, c.course_name,
                        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date, a.status
                 FROM assignments a
                 INNER JOIN courses c ON c.course_id = a.course_id
                 ORDER BY a.created_at DESC
                 LIMIT 10`
            ),
        ]);

        const countValue = (row, key) => ({ ...row, [key]: Number(row[key]) });
        const scoreValue = (value) => value === null ? null : Number(value);

        return res.json({
            success: true,
            data: {
                summary: numberCounts(summaryRows[0]),
                studentsByDepartment: studentsByDepartment.map((row) =>
                    countValue(row, "student_count")
                ),
                teachersByDepartment: teachersByDepartment.map((row) =>
                    countValue(row, "teacher_count")
                ),
                coursesByDepartment: coursesByDepartment.map((row) =>
                    countValue(row, "course_count")
                ),
                enrollmentsByCourse: enrollmentsByCourse.map((row) =>
                    countValue(row, "enrollment_count")
                ),
                gradesSummaryByCourse: gradesSummaryByCourse.map((row) => ({
                    ...row,
                    graded_students: Number(row.graded_students),
                    average_score: scoreValue(row.average_score),
                    highest_score: scoreValue(row.highest_score),
                    lowest_score: scoreValue(row.lowest_score),
                })),
                recentGrades: recentGrades.map((row) => ({
                    ...row,
                    total_score: Number(row.total_score),
                })),
                recentAssignments,
            },
        });
    } catch (error) {
        console.error("Get admin reports error:", error);
        return res.status(500).json({ success: false, message: "Failed to load admin reports." });
    }
}

export async function getTeacherReports(req, res) {
    try {
        const [teachers] = await db.query(
            `SELECT t.teacher_id, t.teacher_code,
                    CONCAT(t.first_name, ' ', t.last_name) AS full_name,
                    t.gender, d.department_name
             FROM teachers t
             LEFT JOIN departments d ON d.department_id = t.department_id
             WHERE t.user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );
        if (!teachers.length) {
            return res.status(404).json({ success: false, message: "Teacher profile not found." });
        }

        const teacher = teachers[0];
        const [[summaryRows], [courses], [studentsByCourse], [gradesByCourse], [assignmentsByCourse]] =
            await Promise.all([
                db.query(
                    `SELECT
                        (SELECT COUNT(*) FROM courses c WHERE c.teacher_id = ?) AS totalCourses,
                        (SELECT COUNT(DISTINCT e.student_id)
                         FROM enrollments e
                         INNER JOIN courses c ON c.course_id = e.course_id
                         WHERE c.teacher_id = ? AND e.status = 'active') AS totalStudents,
                        (SELECT COUNT(*)
                         FROM assignments a
                         INNER JOIN courses c ON c.course_id = a.course_id
                         WHERE a.teacher_id = ? AND c.teacher_id = ?) AS totalAssignments,
                        (SELECT COUNT(*)
                         FROM grades g
                         INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                         INNER JOIN courses c ON c.course_id = e.course_id
                         WHERE c.teacher_id = ?) AS totalGrades`,
                    [
                        teacher.teacher_id,
                        teacher.teacher_id,
                        teacher.teacher_id,
                        teacher.teacher_id,
                        teacher.teacher_id,
                    ]
                ),
                db.query(
                    `SELECT c.course_code, c.course_name, d.department_name,
                            c.semester, c.credit, c.status,
                            COUNT(e.enrollment_id) AS student_count
                     FROM courses c
                     LEFT JOIN departments d ON d.department_id = c.department_id
                     LEFT JOIN enrollments e
                            ON e.course_id = c.course_id AND e.status = 'active'
                     WHERE c.teacher_id = ?
                     GROUP BY c.course_id, c.course_code, c.course_name,
                              d.department_name, c.semester, c.credit, c.status
                     ORDER BY c.course_code ASC`,
                    [teacher.teacher_id]
                ),
                db.query(
                    `SELECT c.course_code, c.course_name, s.student_code,
                            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                            s.gender, e.status AS enrollment_status
                     FROM enrollments e
                     INNER JOIN students s ON s.student_id = e.student_id
                     INNER JOIN courses c ON c.course_id = e.course_id
                     WHERE c.teacher_id = ? AND e.status = 'active'
                     ORDER BY c.course_code ASC, s.student_code ASC`,
                    [teacher.teacher_id]
                ),
                db.query(
                    `SELECT c.course_code, c.course_name, s.student_code,
                            CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                            g.assignment_score, g.midterm_score, g.final_score,
                            g.total_score, g.grade_letter, g.remark
                     FROM grades g
                     INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                     INNER JOIN students s ON s.student_id = e.student_id
                     INNER JOIN courses c ON c.course_id = e.course_id
                     WHERE c.teacher_id = ?
                     ORDER BY c.course_code ASC, s.student_code ASC`,
                    [teacher.teacher_id]
                ),
                db.query(
                    `SELECT c.course_code, c.course_name, a.title,
                            DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date,
                            a.max_score, a.status
                     FROM assignments a
                     INNER JOIN courses c ON c.course_id = a.course_id
                     WHERE a.teacher_id = ? AND c.teacher_id = ?
                     ORDER BY c.course_code ASC, a.due_date ASC`,
                    [teacher.teacher_id, teacher.teacher_id]
                ),
            ]);

        return res.json({
            success: true,
            data: {
                summary: numberCounts(summaryRows[0]),
                teacher: {
                    teacher_code: teacher.teacher_code,
                    full_name: teacher.full_name,
                    gender: teacher.gender,
                    department_name: teacher.department_name,
                },
                courses: courses.map((course) => ({
                    ...course,
                    student_count: Number(course.student_count),
                })),
                studentsByCourse,
                gradesByCourse: gradesByCourse.map((grade) => ({
                    ...grade,
                    assignment_score: Number(grade.assignment_score),
                    midterm_score: Number(grade.midterm_score),
                    final_score: Number(grade.final_score),
                    total_score: Number(grade.total_score),
                })),
                assignmentsByCourse: assignmentsByCourse.map((assignment) => ({
                    ...assignment,
                    max_score: Number(assignment.max_score),
                })),
            },
        });
    } catch (error) {
        console.error("Get teacher reports error:", error);
        return res.status(500).json({ success: false, message: "Failed to load teacher reports." });
    }
}

export async function getStudentReports(req, res) {
    try {
        const [students] = await db.query(
            `SELECT s.student_id, s.student_code,
                    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
                    s.gender, d.department_name, s.year_level, s.status
             FROM students s
             LEFT JOIN departments d ON d.department_id = s.department_id
             WHERE s.user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );
        if (!students.length) {
            return res.status(404).json({ success: false, message: "Student profile not found." });
        }

        const student = students[0];
        const [[summaryRows], [enrolledCourses], [assignments], [grades]] = await Promise.all([
            db.query(
                `SELECT
                    (SELECT COUNT(*)
                     FROM enrollments e
                     WHERE e.student_id = ? AND e.status = 'active') AS totalCourses,
                    (SELECT COUNT(DISTINCT a.assignment_id)
                     FROM assignments a
                     INNER JOIN enrollments e ON e.course_id = a.course_id
                     WHERE e.student_id = ? AND e.status = 'active') AS totalAssignments,
                    (SELECT COUNT(*)
                     FROM grades g
                     INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                     WHERE e.student_id = ?) AS totalGrades,
                    (SELECT ROUND(AVG(g.total_score), 2)
                     FROM grades g
                     INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                     WHERE e.student_id = ?) AS averageScore`,
                [student.student_id, student.student_id, student.student_id, student.student_id]
            ),
            db.query(
                `SELECT c.course_code, c.course_name,
                        CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
                        c.semester, c.credit,
                        DATE_FORMAT(e.enrollment_date, '%Y-%m-%d') AS enrollment_date,
                        e.status AS enrollment_status
                 FROM enrollments e
                 INNER JOIN courses c ON c.course_id = e.course_id
                 LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
                 WHERE e.student_id = ? AND e.status = 'active'
                 ORDER BY c.course_code ASC`,
                [student.student_id]
            ),
            db.query(
                `SELECT c.course_code, c.course_name, a.title, a.description,
                        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date,
                        a.max_score, a.status
                 FROM assignments a
                 INNER JOIN courses c ON c.course_id = a.course_id
                 INNER JOIN enrollments e ON e.course_id = a.course_id
                 WHERE e.student_id = ? AND e.status = 'active'
                 ORDER BY a.due_date ASC`,
                [student.student_id]
            ),
            db.query(
                `SELECT c.course_code, c.course_name,
                        CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
                        g.assignment_score, g.midterm_score, g.final_score,
                        g.total_score, g.grade_letter, g.remark
                 FROM grades g
                 INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                 INNER JOIN courses c ON c.course_id = e.course_id
                 LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
                 WHERE e.student_id = ?
                 ORDER BY c.course_code ASC`,
                [student.student_id]
            ),
        ]);

        const summary = numberCounts({
            totalCourses: summaryRows[0].totalCourses,
            totalAssignments: summaryRows[0].totalAssignments,
            totalGrades: summaryRows[0].totalGrades,
        });
        summary.averageScore = summaryRows[0].averageScore === null
            ? null
            : Number(summaryRows[0].averageScore);

        return res.json({
            success: true,
            data: {
                summary,
                student: {
                    student_code: student.student_code,
                    full_name: student.full_name,
                    gender: student.gender,
                    department_name: student.department_name,
                    year_level: student.year_level,
                    status: student.status,
                },
                enrolledCourses,
                assignments: assignments.map((assignment) => ({
                    ...assignment,
                    max_score: Number(assignment.max_score),
                })),
                grades: grades.map((grade) => ({
                    ...grade,
                    assignment_score: Number(grade.assignment_score),
                    midterm_score: Number(grade.midterm_score),
                    final_score: Number(grade.final_score),
                    total_score: Number(grade.total_score),
                })),
            },
        });
    } catch (error) {
        console.error("Get student reports error:", error);
        return res.status(500).json({ success: false, message: "Failed to load student reports." });
    }
}

export async function getTeacherDashboard(req, res) {
    try {
        const [teachers] = await db.query(
            `SELECT t.teacher_id, t.teacher_code,
                    CONCAT(t.first_name, ' ', t.last_name) AS full_name,
                    t.gender, d.department_name
             FROM teachers t
             LEFT JOIN departments d ON d.department_id = t.department_id
             WHERE t.user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );
        if (!teachers.length) {
            return res.status(404).json({ success: false, message: "Teacher profile not found." });
        }

        const teacher = teachers[0];
        const [[countRows], [courses], [recentAssignments]] = await Promise.all([
            db.query(
                `SELECT
                    (SELECT COUNT(*) FROM courses c WHERE c.teacher_id = ?) AS totalCourses,
                    (SELECT COUNT(DISTINCT e.student_id)
                     FROM enrollments e
                     INNER JOIN courses c ON c.course_id = e.course_id
                     WHERE c.teacher_id = ? AND e.status = 'active') AS totalStudents,
                    (SELECT COUNT(*) FROM assignments a WHERE a.teacher_id = ?) AS totalAssignments,
                    (SELECT COUNT(*)
                     FROM grades g
                     INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                     INNER JOIN courses c ON c.course_id = e.course_id
                     WHERE c.teacher_id = ?) AS totalGrades`,
                [teacher.teacher_id, teacher.teacher_id, teacher.teacher_id, teacher.teacher_id]
            ),
            db.query(
                `SELECT c.course_code, c.course_name, c.semester, c.credit,
                        COUNT(e.enrollment_id) AS student_count
                 FROM courses c
                 LEFT JOIN enrollments e
                        ON e.course_id = c.course_id AND e.status = 'active'
                 WHERE c.teacher_id = ?
                 GROUP BY c.course_id, c.course_code, c.course_name, c.semester, c.credit
                 ORDER BY c.course_code ASC`,
                [teacher.teacher_id]
            ),
            db.query(
                `SELECT a.title, c.course_code, c.course_name,
                        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date, a.status
                 FROM assignments a
                 INNER JOIN courses c ON c.course_id = a.course_id
                 WHERE a.teacher_id = ?
                 ORDER BY a.due_date ASC, a.assignment_id DESC
                 LIMIT 5`,
                [teacher.teacher_id]
            ),
        ]);

        const teacherData = {
            teacher_code: teacher.teacher_code,
            full_name: teacher.full_name,
            gender: teacher.gender,
            department_name: teacher.department_name,
        };
        return res.json({
            success: true,
            data: {
                teacher: teacherData,
                ...numberCounts(countRows[0]),
                courses: courses.map((course) => ({
                    ...course,
                    student_count: Number(course.student_count),
                })),
                recentAssignments,
            },
        });
    } catch (error) {
        console.error("Get teacher dashboard error:", error);
        return res.status(500).json({ success: false, message: "Failed to load teacher dashboard." });
    }
}

export async function getStudentDashboard(req, res) {
    try {
        const [students] = await db.query(
            `SELECT s.student_id, s.student_code,
                    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
                    s.gender, d.department_name, s.year_level, s.status
             FROM students s
             LEFT JOIN departments d ON d.department_id = s.department_id
             WHERE s.user_id = ?
             LIMIT 1`,
            [req.user.user_id]
        );
        if (!students.length) {
            return res.status(404).json({ success: false, message: "Student profile not found." });
        }

        const student = students[0];
        const [[countRows], [enrolledCourses], [recentAssignments], [grades]] = await Promise.all([
            db.query(
                `SELECT
                    (SELECT COUNT(*)
                     FROM enrollments e
                     WHERE e.student_id = ? AND e.status = 'active') AS totalCourses,
                    (SELECT COUNT(DISTINCT a.assignment_id)
                     FROM assignments a
                     INNER JOIN enrollments e ON e.course_id = a.course_id
                     WHERE e.student_id = ? AND e.status = 'active' AND a.status = 'active') AS totalAssignments,
                    (SELECT COUNT(*)
                     FROM grades g
                     INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                     WHERE e.student_id = ?) AS totalGrades`,
                [student.student_id, student.student_id, student.student_id]
            ),
            db.query(
                `SELECT c.course_code, c.course_name,
                        CONCAT(t.first_name, ' ', t.last_name) AS teacher_name,
                        c.semester, e.status
                 FROM enrollments e
                 INNER JOIN courses c ON c.course_id = e.course_id
                 LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
                 WHERE e.student_id = ? AND e.status = 'active'
                 ORDER BY c.course_code ASC`,
                [student.student_id]
            ),
            db.query(
                `SELECT a.title, c.course_code, c.course_name,
                        DATE_FORMAT(a.due_date, '%Y-%m-%d') AS due_date, a.status
                 FROM assignments a
                 INNER JOIN courses c ON c.course_id = a.course_id
                 INNER JOIN enrollments e ON e.course_id = a.course_id
                 WHERE e.student_id = ? AND e.status = 'active' AND a.status = 'active'
                 ORDER BY a.due_date ASC, a.assignment_id DESC
                 LIMIT 5`,
                [student.student_id]
            ),
            db.query(
                `SELECT c.course_code, c.course_name, g.total_score, g.grade_letter
                 FROM grades g
                 INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
                 INNER JOIN courses c ON c.course_id = e.course_id
                 WHERE e.student_id = ?
                 ORDER BY c.course_code ASC
                 LIMIT 5`,
                [student.student_id]
            ),
        ]);

        const studentData = {
            student_code: student.student_code,
            full_name: student.full_name,
            gender: student.gender,
            department_name: student.department_name,
            year_level: student.year_level,
            status: student.status,
        };
        return res.json({
            success: true,
            data: {
                student: studentData,
                ...numberCounts(countRows[0]),
                enrolledCourses,
                recentAssignments,
                grades,
            },
        });
    } catch (error) {
        console.error("Get student dashboard error:", error);
        return res.status(500).json({ success: false, message: "Failed to load student dashboard." });
    }
}

export async function getReportLogs(req, res) {
    try {
        const params = [];
        let scope = "";
        if (req.user.role !== "admin") { scope = "WHERE r.generated_by = ?"; params.push(req.user.user_id); }
        const [rows] = await db.query(
            `SELECT r.report_id AS reportId, r.report_type AS reportType,
                    r.file_format AS fileFormat, r.file_name AS fileName,
                    r.generated_at AS generatedAt, u.username AS generatedBy
             FROM report_logs r
             LEFT JOIN users u ON u.user_id = r.generated_by
             ${scope}
             ORDER BY r.generated_at DESC`, params
        );
        return res.json({ success: true, message: "Report history loaded successfully", data: rows });
    } catch (error) {
        console.error("Get report logs error:", error);
        return res.status(500).json({ success: false, message: "Failed to load report history" });
    }
}

export async function createReportLog(req, res) {
    const { reportType, fileFormat, fileName = null } = req.body;
    if (!reportType?.trim() || !["pdf", "excel"].includes(fileFormat)) {
        return res.status(400).json({ success: false, message: "Report type and valid file format are required." });
    }
    try {
        const [result] = await db.query(
            `INSERT INTO report_logs (generated_by, report_type, file_format, file_name)
             VALUES (?, ?, ?, ?)`,
            [req.user.user_id, reportType.trim(), fileFormat, fileName]
        );
        return res.status(201).json({ success: true, message: "Report logged successfully", data: { reportId: result.insertId } });
    } catch (error) {
        console.error("Create report log error:", error);
        return res.status(500).json({ success: false, message: "Failed to log report" });
    }
}
