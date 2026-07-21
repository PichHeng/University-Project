import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
} from "../controllers/teacherController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getTeachers);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;