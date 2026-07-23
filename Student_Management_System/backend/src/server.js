
// // import db from "./config/db.js";
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const db = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const app = express();
// const PORT = process.env.PORT || 5000;




// // Middleware

// app.use(
//     cors({
//         origin: process.env.CLIENT_URL || "http://localhost:5173",
//         credentials: true,
//     })
// );

// app.use(express.json());

// app.use("/api/auth", authRoutes);

// // Default Route

// app.get("/", (req, res) => {
//     res.json({
//         message: "Student Management System API is running",
//     });
// });

// // Health check route
// app.get("/api/health", async (req, res) => {
//     try {
//         const [rows] = await db.query("SELECT NOW() AS server_time");

//         res.json({
//             success: true,
//             message: "Backend and database are running",
//             serverTime: rows[0].server_time,
//         });
//     } catch (error) {
//         console.error("Database health check error:", error);

//         res.status(500).json({
//             success: false,
//             message: "Database connection failed",
//             error: error.message,
//         });
//     }
// });

// // 404 route
// app.use((req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "API Route not found",
//     });
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import assignmentSubmissionRoutes from "./routes/assignmentSubmissionRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";


dotenv.config({ quiet: true });

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT NOW() AS server_time");

        res.json({
            success: true,
            message: "Backend and database are running",
            serverTime: rows[0].server_time,
        });
    } catch (error) {
        console.error("Database health check error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });
    }
});

// app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/assignment-submissions", assignmentSubmissionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found.",
    });
});

app.use((error, req, res, next) => {
    console.error("Unhandled request error:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
