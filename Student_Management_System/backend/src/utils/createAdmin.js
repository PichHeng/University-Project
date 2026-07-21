import bcrypt from "bcrypt";
import dotenv from "dotenv";

import db from "../config/db.js";

dotenv.config({ quiet: true });

async function createAdmin() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        throw new Error(
            "ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment."
        );
    }

    if (password.length < 8) {
        throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
    }

    const [existingAdmins] = await db.query(
        "SELECT user_id FROM users WHERE username = ? LIMIT 1",
        [username]
    );

    if (existingAdmins.length > 0) {
        console.log("Admin account already exists.");
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.query(
        `INSERT INTO users (username, password_hash, role, status)
         VALUES (?, ?, 'admin', 'active')`,
        [username, passwordHash]
    );

    console.log("Admin account created successfully.");
}

try {
    await createAdmin();
} catch (error) {
    console.error("Create admin error:", error.message);
    process.exitCode = 1;
} finally {
    await db.end();
}
