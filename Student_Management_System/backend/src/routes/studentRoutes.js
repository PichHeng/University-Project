import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentGradesByYear,
    getMyStudentProfile,
    getNextStudentCode,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(protect);

router.get("/me", allowRoles("student"), getMyStudentProfile);
router.get("/next-code", allowRoles("admin"), getNextStudentCode);
router.get("/", allowRoles("admin"), getStudents);
router.get("/:id/grades-by-year", allowRoles("admin"), getStudentGradesByYear);
router.post("/", allowRoles("admin"), createStudent);
router.put("/:id", allowRoles("admin"), updateStudent);
router.delete("/:id", allowRoles("admin"), deleteStudent);

export default router;
