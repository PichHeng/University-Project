import express from "express";
import { createReportLog, getReportLogs } from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", allowRoles("admin", "teacher", "student"), getReportLogs);
router.post("/", allowRoles("admin", "teacher", "student"), createReportLog);

export default router;
