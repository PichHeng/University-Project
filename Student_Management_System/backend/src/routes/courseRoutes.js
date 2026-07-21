import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getCourses);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;