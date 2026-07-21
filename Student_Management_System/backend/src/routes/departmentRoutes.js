import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../controllers/departmentController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getDepartments);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;