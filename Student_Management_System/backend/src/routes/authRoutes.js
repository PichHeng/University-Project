

// const express = require("express");
// const { login, getMe } = require("../controllers/authController");
// const protect = require("../middleware/authMiddleware");
// const router = express.Router();

// router.post("/login", login);
// router.get("/me", protect, getMe);

// module.exports = router;


import express from "express";

import { login, getMe } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMe);

export default router;