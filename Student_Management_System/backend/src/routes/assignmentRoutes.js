import express from "express";
import {
    createAssignment,
    deleteAssignment,
    getAssignments,
    updateAssignment,
} from "../controllers/assignmentController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", allowRoles("admin", "teacher", "student"), getAssignments);
router.post("/", allowRoles("admin", "teacher"), createAssignment);
router.put("/:id", allowRoles("admin", "teacher"), updateAssignment);
router.delete("/:id", allowRoles("admin", "teacher"), deleteAssignment);

export default router;
