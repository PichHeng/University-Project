import db from "../config/db.js";

function formatStatus(status) {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function toDbStatus(status) {
    return status?.toLowerCase() === "inactive" ? "inactive" : "active";
}

function toDbCredit(credit) {
    const number = Number(credit);
    return Number.isNaN(number) || number <= 0 ? 3 : number;
}

async function findDepartmentId(department) {
    if (!department) return null;

    const [departments] = await db.query(
        `SELECT department_id
     FROM departments
     WHERE department_name = ?
        OR department_code = ?
     LIMIT 1`,
        [department, department]
    );

    if (departments.length === 0) return null;

    return departments[0].department_id;
}

async function findTeacherId(teacher) {
    if (!teacher || teacher === "Unassigned") return null;

    const [teachers] = await db.query(
        `SELECT teacher_id
     FROM teachers
     WHERE teacher_code = ?
        OR CONCAT(first_name, ' ', last_name) = ?
     LIMIT 1`,
        [teacher, teacher]
    );

    if (teachers.length === 0) return null;

    return teachers[0].teacher_id;
}

export async function getCourses(req, res) {
    try {
        const [courses] = await db.query(
            `SELECT
        c.course_id AS id,
        c.department_id AS departmentId,
        c.teacher_id AS teacherId,
        c.course_code AS courseCode,
        c.course_name AS courseName,
        c.credit,
        c.semester,
        c.description,
        c.status,
        d.department_code AS departmentCode,
        d.department_name AS department,
        t.teacher_code AS teacherCode,
        CONCAT(t.first_name, ' ', t.last_name) AS teacher
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      ORDER BY c.course_code ASC`
        );

        const formattedCourses = courses.map((course) => ({
            ...course,
            department: course.department || "No Department",
            teacher: course.teacher || "Unassigned",
            teacherCode: course.teacherCode || "",
            description: course.description || "",
            semester: course.semester || "",
            status: formatStatus(course.status),
        }));

        res.json({
            success: true,
            data: formattedCourses,
        });
    } catch (error) {
        console.error("Get courses error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message,
        });
    }
}

export async function createCourse(req, res) {
    try {
        const {
            courseCode,
            courseName,
            department,
            teacher,
            credit,
            semester,
            description,
            status,
        } = req.body;

        if (!courseCode || !courseName || !department) {
            return res.status(400).json({
                success: false,
                message: "Course code, course name, and department are required.",
            });
        }

        const departmentId = await findDepartmentId(department);

        if (!departmentId) {
            return res.status(404).json({
                success: false,
                message: "Department not found. Please create the department first.",
            });
        }

        const teacherId = await findTeacherId(teacher);

        if (teacher && teacher !== "Unassigned" && !teacherId) {
            return res.status(404).json({
                success: false,
                message:
                    "Teacher not found. Use the teacher code such as TCH-2001 or leave teacher empty.",
            });
        }

        const [result] = await db.query(
            `INSERT INTO courses
        (
          department_id,
          teacher_id,
          course_code,
          course_name,
          credit,
          semester,
          description,
          status
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                departmentId,
                teacherId,
                courseCode,
                courseName,
                toDbCredit(credit),
                semester || null,
                description || null,
                toDbStatus(status),
            ]
        );

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: {
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error("Create course error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });
    }
}

export async function updateCourse(req, res) {
    try {
        const { id } = req.params;

        const {
            courseCode,
            courseName,
            department,
            teacher,
            credit,
            semester,
            description,
            status,
        } = req.body;

        if (!courseCode || !courseName || !department) {
            return res.status(400).json({
                success: false,
                message: "Course code, course name, and department are required.",
            });
        }

        const departmentId = await findDepartmentId(department);

        if (!departmentId) {
            return res.status(404).json({
                success: false,
                message: "Department not found. Please create the department first.",
            });
        }

        const teacherId = await findTeacherId(teacher);

        if (teacher && teacher !== "Unassigned" && !teacherId) {
            return res.status(404).json({
                success: false,
                message:
                    "Teacher not found. Use the teacher code such as TCH-2001 or leave teacher empty.",
            });
        }

        const [result] = await db.query(
            `UPDATE courses
       SET
        department_id = ?,
        teacher_id = ?,
        course_code = ?,
        course_name = ?,
        credit = ?,
        semester = ?,
        description = ?,
        status = ?
       WHERE course_id = ?`,
            [
                departmentId,
                teacherId,
                courseCode,
                courseName,
                toDbCredit(credit),
                semester || null,
                description || null,
                toDbStatus(status),
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        res.json({
            success: true,
            message: "Course updated successfully",
        });
    } catch (error) {
        console.error("Update course error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update course",
            error: error.message,
        });
    }
}

export async function deleteCourse(req, res) {
    try {
        const { id } = req.params;

        const [usage] = await db.query(
            `SELECT
        COUNT(*) AS enrollmentCount
       FROM enrollments
       WHERE course_id = ?`,
            [id]
        );

        const enrollmentCount = usage[0].enrollmentCount;

        if (enrollmentCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete this course because it has enrollment records.",
            });
        }

        const [result] = await db.query(
            "DELETE FROM courses WHERE course_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Course not found.",
            });
        }

        res.json({
            success: true,
            message: "Course deleted successfully",
        });
    } catch (error) {
        console.error("Delete course error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete course",
            error: error.message,
        });
    }
}

export async function getMyTeacherCourses(req, res) {
    try {
        const [courses] = await db.query(
            `SELECT c.course_id, c.course_code, c.course_name,
                    c.credit, c.semester, c.description, c.status,
                    d.department_name, d.department_code,
                    COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.student_id END)
                        AS enrolled_student_count
             FROM courses c
             INNER JOIN teachers t ON t.teacher_id = c.teacher_id
             LEFT JOIN departments d ON d.department_id = c.department_id
             LEFT JOIN enrollments e ON e.course_id = c.course_id
             WHERE t.user_id = ?
               AND c.status = 'active'
             GROUP BY c.course_id
             ORDER BY c.course_code ASC`,
            [req.user.user_id]
        );

        return res.json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Get teacher courses error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch your courses." });
    }
}

export async function getCourseStudents(req, res) {
    try {
        const { id } = req.params;
        const courseParams = [id];
        let teacherScope = "";
        if (req.user.role === "teacher") {
            teacherScope = "AND t.user_id = ?";
            courseParams.push(req.user.user_id);
        }

        const [courses] = await db.query(
            `SELECT c.course_id AS id, c.course_code AS courseCode,
                    c.course_name AS courseName, c.credit, c.semester,
                    d.department_name AS department,
                    CONCAT(t.first_name, ' ', t.last_name) AS teacher
             FROM courses c
             LEFT JOIN departments d ON d.department_id = c.department_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE c.course_id = ? ${teacherScope}
             LIMIT 1`,
            courseParams
        );

        if (!courses.length) {
            return res.status(404).json({ success: false, message: "Course not found." });
        }

        const [students] = await db.query(
            `SELECT s.student_id AS id, e.enrollment_id AS enrollmentId,
                    s.student_code AS studentCode,
                    CONCAT(s.first_name, ' ', s.last_name) AS studentName,
                    d.department_name AS department, s.year_level AS yearLevel,
                    s.email, e.enrollment_date AS enrollmentDate,
                    e.status AS enrollmentStatus
             FROM enrollments e
             INNER JOIN students s ON s.student_id = e.student_id
             LEFT JOIN departments d ON d.department_id = s.department_id
             WHERE e.course_id = ?
             ORDER BY s.student_code ASC`,
            [id]
        );

        return res.json({
            success: true,
            data: {
                course: {
                    ...courses[0],
                    department: courses[0].department || "No Department",
                    teacher: courses[0].teacher || "Unassigned",
                    semester: courses[0].semester || "",
                },
                students: students.map((student) => ({
                    ...student,
                    department: student.department || "No Department",
                    enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().slice(0, 10) : "",
                    enrollmentStatus: formatStatus(student.enrollmentStatus),
                })),
                totalStudents: students.length,
            },
        });
    } catch (error) {
        console.error("Get course students error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch course students." });
    }
}
