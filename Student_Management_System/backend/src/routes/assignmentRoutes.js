import express from "express";

import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getMyStudentAssignments,
} from "../controllers/assignmentController.js";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

// Student route
// GET /api/assignments/student/me
router.get(
  "/student/me",
  allowRoles("student"),
  getMyStudentAssignments
);

// Admin and Teacher routes
// GET /api/assignments
router.get("/", allowRoles("admin", "teacher"), getAssignments);

// POST /api/assignments
router.post("/", allowRoles("admin", "teacher"), createAssignment);

// PUT /api/assignments/:id
router.put("/:id", allowRoles("admin", "teacher"), updateAssignment);

// DELETE /api/assignments/:id
router.delete("/:id", allowRoles("admin", "teacher"), deleteAssignment);

export default router;