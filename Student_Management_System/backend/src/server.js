

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

// Default Route

app.get("/", (req, res) => {
    res.json({
        message: "Student Management System API is running",
    });
});

// Health check route
app.get("/api/health", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS database_name, NOW() AS server_time"
        );
        res.status(200).json({
            success: true,
            message: "Backend and MySQL are connected successfully",
            database: rows[0].database_name,
            serverTime: rows[0].current_time,
        });
    } catch (error) {
        console.error("Database connection error :", error.message);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
        });const authRoutes = require("./routes/authRoutes");
    }
});


// 404 route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route not found",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});