




const bcrypt = require("bcrypt");
require("dotenv").config();

const db = require("../config/db");

const createAdmin = async () => {
    try {
        const username = "admin";
        const password = "Admin@123";

        const [existingAdmin] = await db.query(
            "SELECT user_id FROM users WHERE username = ? LIMIT 1",
            [username]
        );

        if (existingAdmin.length > 0) {
            console.log("អាហុង account already exists.");
            process.exit(0);
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        await db.query(
            "INSERT INTO users (username, password_hash, role, status) VALUE (?, ?, ?, ?)",
            [username, passwordHash, "admin", "active"]
        );

        console.log("Admin account created successfully.");
        console.log("Username: admin");
        console.log("Password: Admin@123");

        process.exit(0);
    } catch (error) {
        console.error("Create admin error ", error.message);
        process.exit(1);
    }
};

createAdmin();