import express from "express";
import {
    createReportLog,
    getAdminDashboard,
    getAdminReports,
    getReportLogs,
    getStudentDashboard,
    getStudentReports,
    getTeacherDashboard,
    getTeacherReports,
} from "../controllers/reportController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/admin-dashboard", allowRoles("admin"), getAdminDashboard);
router.get("/admin", allowRoles("admin"), getAdminReports);
router.get("/teacher", allowRoles("teacher"), getTeacherReports);
router.get("/student", allowRoles("student"), getStudentReports);
router.get("/teacher-dashboard", allowRoles("teacher"), getTeacherDashboard);
router.get("/student-dashboard", allowRoles("student"), getStudentDashboard);
router.get("/", allowRoles("admin", "teacher", "student"), getReportLogs);
router.post("/", allowRoles("admin", "teacher", "student"), createReportLog);

export default router;
