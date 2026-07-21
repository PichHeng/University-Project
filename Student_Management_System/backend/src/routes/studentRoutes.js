import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
} from "../controllers/studentController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;