import db from "../config/db.js";

const DEMO_COURSE_CODES = ["WEB-301", "WEB-302"];
const DEMO_TEACHER_CODES = ["TCH-2001", "TCH-2002"];
const DEMO_USERNAMES = ["tch-2001", "tch-2002"];

async function cleanupDemoData() {
  let connection;
  let transactionStarted = false;

  console.log("Starting cleanup");

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [demoCourses] = await connection.execute(
      `SELECT course_id, course_code
       FROM courses
       WHERE course_code IN (?, ?)
       FOR UPDATE`,
      DEMO_COURSE_CODES,
    );

    const [demoTeachers] = await connection.execute(
      `SELECT teacher_id, teacher_code, user_id
       FROM teachers
       WHERE teacher_code IN (?, ?)
       FOR UPDATE`,
      DEMO_TEACHER_CODES,
    );

    console.log(`Demo courses found: ${demoCourses.length}`);
    console.log(`Demo teachers found: ${demoTeachers.length}`);

    const [attendanceResult] = await connection.execute(
      `DELETE a
       FROM attendance a
       INNER JOIN enrollments e ON e.enrollment_id = a.enrollment_id
       INNER JOIN courses c ON c.course_id = e.course_id
       WHERE c.course_code IN (?, ?)`,
      DEMO_COURSE_CODES,
    );

    const [gradesResult] = await connection.execute(
      `DELETE g
       FROM grades g
       INNER JOIN enrollments e ON e.enrollment_id = g.enrollment_id
       INNER JOIN courses c ON c.course_id = e.course_id
       WHERE c.course_code IN (?, ?)`,
      DEMO_COURSE_CODES,
    );

    const [enrollmentsResult] = await connection.execute(
      `DELETE e
       FROM enrollments e
       INNER JOIN courses c ON c.course_id = e.course_id
       WHERE c.course_code IN (?, ?)`,
      DEMO_COURSE_CODES,
    );

    const [courseAssignmentsResult] = await connection.execute(
      `DELETE a
       FROM assignments a
       INNER JOIN courses c ON c.course_id = a.course_id
       WHERE c.course_code IN (?, ?)`,
      DEMO_COURSE_CODES,
    );

    const [coursesResult] = await connection.execute(
      `DELETE FROM courses
       WHERE course_code IN (?, ?)`,
      DEMO_COURSE_CODES,
    );

    const [teacherAssignmentsResult] = await connection.execute(
      `DELETE a
       FROM assignments a
       INNER JOIN teachers t ON t.teacher_id = a.teacher_id
       WHERE t.teacher_code IN (?, ?)`,
      DEMO_TEACHER_CODES,
    );

    const [teachersResult] = await connection.execute(
      `DELETE FROM teachers
       WHERE teacher_code IN (?, ?)`,
      DEMO_TEACHER_CODES,
    );

    const [usersResult] = await connection.execute(
      `DELETE FROM users
       WHERE username IN (?, ?)
         AND role = 'teacher'`,
      DEMO_USERNAMES,
    );

    await connection.commit();
    transactionStarted = false;

    console.log("Deleted counts:");
    console.table([
      { record_type: "Attendance", deleted: attendanceResult.affectedRows },
      { record_type: "Grades", deleted: gradesResult.affectedRows },
      { record_type: "Enrollments", deleted: enrollmentsResult.affectedRows },
      {
        record_type: "Assignments for demo courses",
        deleted: courseAssignmentsResult.affectedRows,
      },
      { record_type: "Courses", deleted: coursesResult.affectedRows },
      {
        record_type: "Remaining assignments by demo teachers",
        deleted: teacherAssignmentsResult.affectedRows,
      },
      { record_type: "Teachers", deleted: teachersResult.affectedRows },
      { record_type: "Teacher users", deleted: usersResult.affectedRows },
    ]);
    console.log("Cleanup completed successfully");
  } catch (error) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Cleanup rollback failed:", rollbackError.message);
      }
    }

    throw error;
  } finally {
    connection?.release();
  }
}

try {
  await cleanupDemoData();
} catch (error) {
  console.error("Cleanup failed:", error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
