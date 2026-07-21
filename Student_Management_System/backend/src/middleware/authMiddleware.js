// const jwt = require("jsonwebtoken");

// const protect = (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "No token provided. Access denied.",
//             });
//         }

//         const token = authHeader.split(" ")[1];

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         req.user = decoded;

//         next();
//     } catch (error) {
//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token",
//             error: error.message,
//         });
//     }
// };

// export default protect;


import jwt from "jsonwebtoken";

import db from "../config/db.js";

function getJwtSecret() {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return process.env.JWT_SECRET;
}

async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, getJwtSecret());

        const [users] = await db.query(
            `SELECT 
        user_id, 
        username, 
        role, 
        status 
       FROM users 
       WHERE user_id = ? 
       LIMIT 1`,
            [decoded.user_id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. User not found.",
            });
        }

        const user = users[0];

        if (user.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Account is inactive.",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);

        res.status(401).json({
            success: false,
            message: "Not authorized. Invalid token.",
        });
    }
}

export default protect;
