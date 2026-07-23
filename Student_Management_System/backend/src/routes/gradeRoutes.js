import express from "express";

import {
    getMyStudentGrades,
    getGrades,
    getTeacherCourseStudents,
    getTeacherGradeCourses,
    saveGrade,
    saveTeacherGrade,
    saveTeacherGradesBulk,
} from "../controllers/gradeController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/teacher/courses", allowRoles("teacher"), getTeacherGradeCourses);
router.get(
    "/teacher/course/:courseId/students",
    allowRoles("teacher"),
    getTeacherCourseStudents
);
router.post("/teacher", allowRoles("teacher"), saveTeacherGrade);
router.post("/teacher/bulk", allowRoles("teacher"), saveTeacherGradesBulk);
router.get("/student/me", allowRoles("student"), getMyStudentGrades);

router.get("/", allowRoles("admin"), getGrades);
router.put("/", allowRoles("admin"), saveGrade);

export default router;
