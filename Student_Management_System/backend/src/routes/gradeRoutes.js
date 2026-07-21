import express from "express";
import { getGrades, saveGrade } from "../controllers/gradeController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", allowRoles("admin", "teacher", "student"), getGrades);
router.put("/", allowRoles("admin", "teacher"), saveGrade);

export default router;
