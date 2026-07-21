import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getEnrollments);
router.post("/", createEnrollment);
router.put("/:id", updateEnrollment);
router.delete("/:id", deleteEnrollment);

export default router;