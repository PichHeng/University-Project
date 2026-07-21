import bcrypt from "bcrypt";

import db from "../config/db.js";

function formatStatus(status) {
    if (!status) return "Active";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function formatRole(role) {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function toDbStatus(status) {
    return status?.toLowerCase() === "inactive" ? "inactive" : "active";
}

function toDbRole(role) {
    const value = role?.toLowerCase();

    if (value === "admin") return "admin";
    if (value === "teacher") return "teacher";
    if (value === "student") return "student";

    return "student";
}

export async function getUsers(req, res) {
    try {
        const [users] = await db.query(
            `SELECT
        u.user_id AS id,
        u.username,
        u.role,
        u.status,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt,
        s.student_code AS studentCode,
        CONCAT(s.first_name, ' ', s.last_name) AS studentName,
        t.teacher_code AS teacherCode,
        CONCAT(t.first_name, ' ', t.last_name) AS teacherName
      FROM users u
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN teachers t ON u.user_id = t.user_id
      ORDER BY u.user_id DESC`
        );

        const formattedUsers = users.map((user) => ({
            ...user,
            role: formatRole(user.role),
            status: formatStatus(user.status),
            linkedName: user.studentName || user.teacherName || "System Account",
            linkedCode: user.studentCode || user.teacherCode || "—",
        }));

        res.json({
            success: true,
            data: formattedUsers,
        });
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
}

export async function createUser(req, res) {
    try {
        const { username, password, role, status } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Username, password, and role are required.",
            });
        }

        const dbRole = toDbRole(role);

        if (dbRole !== "admin") {
            return res.status(400).json({
                success: false,
                message:
                    "Create teacher and student accounts from Teacher Management or Student Management. User Management should only create admin accounts.",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users
        (username, password_hash, role, status)
       VALUES (?, ?, ?, ?)`,
            [username, passwordHash, dbRole, toDbStatus(status)]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: result.insertId,
            },
        });
    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message,
        });
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { username, status } = req.body;

        if (!username || !status) {
            return res.status(400).json({
                success: false,
                message: "Username and status are required.",
            });
        }

        const [result] = await db.query(
            `UPDATE users
       SET username = ?, status = ?
       WHERE user_id = ?`,
            [username, toDbStatus(status), id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
        });
    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message,
        });
    }
}

export async function resetUserPassword(req, res) {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters.",
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        const [result] = await db.query(
            `UPDATE users
       SET password_hash = ?
       WHERE user_id = ?`,
            [passwordHash, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message,
        });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        if (Number(id) === Number(req.user.user_id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account while logged in.",
            });
        }

        const [linkedRecords] = await db.query(
            `SELECT
        (SELECT COUNT(*) FROM students WHERE user_id = ?) AS studentCount,
        (SELECT COUNT(*) FROM teachers WHERE user_id = ?) AS teacherCount`,
            [id, id]
        );

        const studentCount = linkedRecords[0].studentCount;
        const teacherCount = linkedRecords[0].teacherCount;

        if (studentCount > 0 || teacherCount > 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Cannot delete this user because it is linked to a student or teacher profile. Delete the student or teacher record instead.",
            });
        }

        const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message,
        });
    }
}