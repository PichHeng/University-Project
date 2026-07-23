import express from "express";

import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
    getUsers,
    createUser,
    updateUser,
    resetUserPassword,
    deleteUser,
    getAdminUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("admin"));

router.get("/", getUsers);
router.get("/admins", getAdminUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/reset-password", resetUserPassword);
router.delete("/:id", deleteUser);

export default router;
