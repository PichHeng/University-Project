import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStudents,
    getMyTeacherCourses,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect);

router.get("/teacher/me", allowRoles("teacher"), getMyTeacherCourses);

router.get("/", allowRoles("admin"), getCourses);
router.get("/:id/students", allowRoles("admin", "teacher"), getCourseStudents);
router.post("/", allowRoles("admin"), createCourse);
router.put("/:id", allowRoles("admin"), updateCourse);
router.delete("/:id", allowRoles("admin"), deleteCourse);

export default router;
