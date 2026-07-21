import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import db from "../config/db.js";

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return process.env.JWT_SECRET;
}

// Create login function
export async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const [users] = await db.query(
            `SELECT 
        user_id, 
        username, 
        password_hash, 
        role, 
        status 
       FROM users 
       WHERE username = ? 
       LIMIT 1`,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        const user = users[0];

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive. Please contact admin.",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
            },
            getJwtSecret(),
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                name: user.username,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: error.message,
        });
    }
}

export async function getMe(req, res) {
    try {
        const [users] = await db.query(
            `SELECT 
        user_id, 
        username, 
        role, 
        status, 
        created_at 
       FROM users 
       WHERE user_id = ? 
       LIMIT 1`,
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const user = users[0];

        res.status(200).json({
            success: true,
            user: {
                ...user,
                name: user.username,
            },
        });
    } catch (error) {
        console.error("Get me error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}
