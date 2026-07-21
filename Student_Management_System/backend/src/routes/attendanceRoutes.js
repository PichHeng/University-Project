import express from "express";
import { getAttendance, saveAttendance } from "../controllers/attendanceController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", allowRoles("admin", "teacher", "student"), getAttendance);
router.put("/", allowRoles("admin", "teacher"), saveAttendance);

export default router;
