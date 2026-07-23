import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    getMyAvailableCourses,
    enrollInCourse,
    getMyEnrolledCourses,
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.use(protect);

router.get("/student/available-courses", allowRoles("student"), getMyAvailableCourses);
router.post("/student/enroll", allowRoles("student"), enrollInCourse);
router.get("/student/my-courses", allowRoles("student"), getMyEnrolledCourses);

router.get("/", allowRoles("admin"), getEnrollments);
router.post("/", allowRoles("admin"), createEnrollment);
router.put("/:id", allowRoles("admin"), updateEnrollment);
router.delete("/:id", allowRoles("admin"), deleteEnrollment);

export default router;
