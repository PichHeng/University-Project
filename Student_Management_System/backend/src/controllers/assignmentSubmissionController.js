import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

import multer from "multer";

import db from "../config/db.js";

const DEFAULT_MAX_UPLOAD_MB = 50;
const configuredMaxUploadMb = Number(process.env.MAX_UPLOAD_MB);
export const maxUploadMb =
    Number.isFinite(configuredMaxUploadMb) && configuredMaxUploadMb > 0
        ? configuredMaxUploadMb
        : DEFAULT_MAX_UPLOAD_MB;

const uploadsRoot = path.resolve(process.cwd(), "uploads", "assignment-submissions");
fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsRoot),
    filename: (req, _file, callback) => {
        const assignmentId = Number.parseInt(req.params.assignmentId, 10) || "unknown";
        const userId = req.user?.user_id || "unknown";
        callback(
            null,
            `assignment-${assignmentId}-user-${userId}-${Date.now()}-${randomUUID()}.pdf`
        );
    },
});

export const uploadAssignmentPdf = multer({
    storage,
    limits: { fileSize: Math.round(maxUploadMb * 1024 * 1024) },
    fileFilter: (_req, file, callback) => {
        const isPdfMime = file.mimetype === "application/pdf";
        const isPdfExtension = path.extname(file.originalname).toLowerCase() === ".pdf";

        if (!isPdfMime || !isPdfExtension) {
            const error = new Error("Only PDF files are allowed.");
            error.code = "PDF_ONLY";
            return callback(error);
        }

        return callback(null, true);
    },
});

function isPositiveId(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function storedRelativePath(filePath) {
    if (!filePath) return null;
    return path.relative(process.cwd(), filePath).split(path.sep).join("/");
}

function resolveStoredPath(filePath) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    const relativeToUploads = path.relative(uploadsRoot, absolutePath);

    if (
        relativeToUploads.startsWith("..") ||
        path.isAbsolute(relativeToUploads) ||
        relativeToUploads === ""
    ) {
        return null;
    }

    return absolutePath;
}

async function removeStoredFile(filePath) {
    if (!filePath) return;

    const absolutePath = resolveStoredPath(filePath);
    if (!absolutePath) return;

    try {
        await fs.promises.unlink(absolutePath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            console.error("Failed to remove assignment submission file:", error);
        }
    }
}

async function hasPdfSignature(filePath) {
    let fileHandle;

    try {
        fileHandle = await fs.promises.open(filePath, "r");
        const header = Buffer.alloc(5);
        const { bytesRead } = await fileHandle.read(header, 0, 5, 0);
        return bytesRead === 5 && header.toString("ascii") === "%PDF-";
    } finally {
        await fileHandle?.close();
    }
}

function submissionSelect() {
    return `
        SELECT
            sub.submission_id,
            sub.assignment_id,
            sub.student_id,
            sub.original_name,
            sub.file_type,
            sub.file_size,
            sub.student_note,
            sub.status,
            sub.is_late,
            sub.teacher_feedback,
            sub.submitted_at,
            sub.reviewed_at,
            a.title AS assignment_title,
            a.due_date,
            c.course_code,
            c.course_name
        FROM assignment_submissions sub
        INNER JOIN assignments a ON a.assignment_id = sub.assignment_id
        INNER JOIN courses c ON c.course_id = a.course_id`;
}

export async function submitAssignment(req, res) {
    const assignmentId = isPositiveId(req.params.assignmentId);
    const uploadedPath = req.file?.path;

    if (!assignmentId) {
        await removeStoredFile(storedRelativePath(uploadedPath));
        return res.status(400).json({ message: "Invalid assignment ID." });
    }

    if (!req.file) {
        return res.status(400).json({ message: "A PDF file is required." });
    }

    const studentNote = typeof req.body.student_note === "string"
        ? req.body.student_note.trim()
        : "";

    if (studentNote.length > 2000) {
        await removeStoredFile(storedRelativePath(uploadedPath));
        return res.status(400).json({ message: "Student note must be 2,000 characters or fewer." });
    }

    try {
        if (!(await hasPdfSignature(uploadedPath))) {
            await removeStoredFile(storedRelativePath(uploadedPath));
            return res.status(400).json({ message: "The uploaded file is not a valid PDF." });
        }
    } catch (error) {
        await removeStoredFile(storedRelativePath(uploadedPath));
        console.error("PDF validation error:", error);
        return res.status(400).json({ message: "The uploaded PDF could not be read." });
    }

    let connection;
    let oldFilePath = null;
    let committed = false;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [students] = await connection.query(
            "SELECT student_id FROM students WHERE user_id = ? AND status = 'active' LIMIT 1",
            [req.user.user_id]
        );

        if (!students.length) {
            await connection.rollback();
            await removeStoredFile(storedRelativePath(uploadedPath));
            return res.status(404).json({ message: "Active student profile not found." });
        }

        const studentId = students[0].student_id;
        const [assignments] = await connection.query(
            `SELECT assignment_id, course_id, status,
                    CASE WHEN due_date IS NOT NULL AND CURDATE() > due_date THEN 1 ELSE 0 END AS is_late
             FROM assignments
             WHERE assignment_id = ?
             LIMIT 1`,
            [assignmentId]
        );

        if (!assignments.length) {
            await connection.rollback();
            await removeStoredFile(storedRelativePath(uploadedPath));
            return res.status(404).json({ message: "Assignment not found." });
        }

        if (assignments[0].status !== "active") {
            await connection.rollback();
            await removeStoredFile(storedRelativePath(uploadedPath));
            return res.status(409).json({ message: "This assignment is closed for submissions." });
        }

        const [enrollments] = await connection.query(
            `SELECT enrollment_id
             FROM enrollments
             WHERE student_id = ? AND course_id = ? AND status = 'active'
             LIMIT 1`,
            [studentId, assignments[0].course_id]
        );

        if (!enrollments.length) {
            await connection.rollback();
            await removeStoredFile(storedRelativePath(uploadedPath));
            return res.status(403).json({
                message: "You are not actively enrolled in this assignment's course.",
            });
        }

        const [existing] = await connection.query(
            `SELECT submission_id, file_path
             FROM assignment_submissions
             WHERE assignment_id = ? AND student_id = ?
             FOR UPDATE`,
            [assignmentId, studentId]
        );

        const values = [
            req.file.filename,
            req.file.originalname,
            storedRelativePath(uploadedPath),
            req.file.mimetype,
            req.file.size,
            studentNote || null,
            Number(assignments[0].is_late),
        ];

        let submissionId;
        let statusCode;
        let message;

        if (existing.length) {
            submissionId = existing[0].submission_id;
            oldFilePath = existing[0].file_path;
            await connection.query(
                `UPDATE assignment_submissions
                 SET file_name = ?, original_name = ?, file_path = ?, file_type = ?,
                     file_size = ?, student_note = ?, status = 'submitted', is_late = ?,
                     teacher_feedback = NULL, submitted_at = CURRENT_TIMESTAMP,
                     reviewed_at = NULL
                 WHERE submission_id = ?`,
                [...values, submissionId]
            );
            statusCode = 200;
            message = "Assignment resubmitted successfully.";
        } else {
            const [result] = await connection.query(
                `INSERT INTO assignment_submissions
                    (assignment_id, student_id, file_name, original_name, file_path,
                     file_type, file_size, student_note, status, is_late)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)`,
                [assignmentId, studentId, ...values]
            );
            submissionId = result.insertId;
            statusCode = 201;
            message = "Assignment submitted successfully.";
        }

        const [rows] = await connection.query(
            `${submissionSelect()} WHERE sub.submission_id = ? LIMIT 1`,
            [submissionId]
        );

        await connection.commit();
        committed = true;

        if (oldFilePath && oldFilePath !== storedRelativePath(uploadedPath)) {
            await removeStoredFile(oldFilePath);
        }

        return res.status(statusCode).json({ message, submission: rows[0] });
    } catch (error) {
        if (connection && !committed) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Assignment submission rollback error:", rollbackError);
            }
        }
        if (!committed) {
            await removeStoredFile(storedRelativePath(uploadedPath));
        }
        console.error("Submit assignment error:", error);
        return res.status(500).json({ message: "Failed to save assignment submission." });
    } finally {
        connection?.release();
    }
}

export async function getMySubmissions(req, res) {
    try {
        const [rows] = await db.query(
            `${submissionSelect()}
             INNER JOIN students s ON s.student_id = sub.student_id
             WHERE s.user_id = ?
             ORDER BY sub.submitted_at DESC`,
            [req.user.user_id]
        );
        return res.json(rows);
    } catch (error) {
        console.error("Get student submissions error:", error);
        return res.status(500).json({ message: "Failed to load your submissions." });
    }
}

export async function getMySubmissionForAssignment(req, res) {
    const assignmentId = isPositiveId(req.params.assignmentId);
    if (!assignmentId) return res.status(400).json({ message: "Invalid assignment ID." });

    try {
        const [rows] = await db.query(
            `${submissionSelect()}
             INNER JOIN students s ON s.student_id = sub.student_id
             WHERE s.user_id = ? AND sub.assignment_id = ?
             LIMIT 1`,
            [req.user.user_id, assignmentId]
        );
        return res.json(rows[0] || null);
    } catch (error) {
        console.error("Get student assignment submission error:", error);
        return res.status(500).json({ message: "Failed to load the submission." });
    }
}

export async function getAssignmentSubmissionsForTeacher(req, res) {
    const assignmentId = isPositiveId(req.params.assignmentId);
    if (!assignmentId) return res.status(400).json({ message: "Invalid assignment ID." });

    try {
        const [assignments] = await db.query(
            `SELECT a.assignment_id, a.course_id
             FROM assignments a
             INNER JOIN courses c ON c.course_id = a.course_id
             INNER JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE a.assignment_id = ? AND t.user_id = ?
             LIMIT 1`,
            [assignmentId, req.user.user_id]
        );

        if (!assignments.length) {
            return res.status(403).json({
                message: "You cannot view submissions for this assignment.",
            });
        }

        const [rows] = await db.query(
            `SELECT
                s.student_id,
                s.student_code,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                s.gender,
                sub.submission_id,
                sub.original_name,
                sub.file_name,
                sub.file_size,
                sub.student_note,
                sub.teacher_feedback,
                sub.is_late,
                sub.status,
                sub.submitted_at,
                sub.reviewed_at
             FROM enrollments e
             INNER JOIN students s ON s.student_id = e.student_id
             LEFT JOIN assignment_submissions sub
                ON sub.assignment_id = ? AND sub.student_id = s.student_id
             WHERE e.course_id = ? AND e.status = 'active' AND s.status = 'active'
             ORDER BY s.student_code ASC`,
            [assignmentId, assignments[0].course_id]
        );

        return res.json(rows);
    } catch (error) {
        console.error("Get teacher assignment submissions error:", error);
        return res.status(500).json({ message: "Failed to load assignment submissions." });
    }
}

export async function saveTeacherFeedback(req, res) {
    const submissionId = isPositiveId(req.params.submissionId);
    if (!submissionId) return res.status(400).json({ message: "Invalid submission ID." });

    const feedback = typeof req.body.teacher_feedback === "string"
        ? req.body.teacher_feedback.trim()
        : "";

    if (!feedback) {
        return res.status(400).json({ message: "Teacher feedback is required." });
    }
    if (feedback.length > 5000) {
        return res.status(400).json({ message: "Teacher feedback must be 5,000 characters or fewer." });
    }

    try {
        const [owned] = await db.query(
            `SELECT sub.submission_id
             FROM assignment_submissions sub
             INNER JOIN assignments a ON a.assignment_id = sub.assignment_id
             INNER JOIN courses c ON c.course_id = a.course_id
             INNER JOIN teachers t ON t.teacher_id = c.teacher_id
             WHERE sub.submission_id = ? AND t.user_id = ?
             LIMIT 1`,
            [submissionId, req.user.user_id]
        );

        if (!owned.length) {
            return res.status(403).json({
                message: "You cannot review this submission.",
            });
        }

        await db.query(
            `UPDATE assignment_submissions
             SET teacher_feedback = ?, status = 'reviewed', reviewed_at = CURRENT_TIMESTAMP
             WHERE submission_id = ?`,
            [feedback, submissionId]
        );

        return res.json({ message: "Feedback saved successfully." });
    } catch (error) {
        console.error("Save assignment feedback error:", error);
        return res.status(500).json({ message: "Failed to save teacher feedback." });
    }
}

export async function downloadSubmission(req, res) {
    const submissionId = isPositiveId(req.params.submissionId);
    if (!submissionId) return res.status(400).json({ message: "Invalid submission ID." });

    try {
        const [rows] = await db.query(
            `SELECT sub.file_path, sub.original_name,
                    student_user.user_id AS student_user_id,
                    teacher_user.user_id AS teacher_user_id
             FROM assignment_submissions sub
             INNER JOIN students s ON s.student_id = sub.student_id
             INNER JOIN users student_user ON student_user.user_id = s.user_id
             INNER JOIN assignments a ON a.assignment_id = sub.assignment_id
             INNER JOIN courses c ON c.course_id = a.course_id
             LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
             LEFT JOIN users teacher_user ON teacher_user.user_id = t.user_id
             WHERE sub.submission_id = ?
             LIMIT 1`,
            [submissionId]
        );

        if (!rows.length) return res.status(404).json({ message: "Submission not found." });

        const submission = rows[0];
        const permitted =
            req.user.role === "admin" ||
            (req.user.role === "student" && submission.student_user_id === req.user.user_id) ||
            (req.user.role === "teacher" && submission.teacher_user_id === req.user.user_id);

        if (!permitted) {
            return res.status(403).json({ message: "You cannot download this submission." });
        }

        const absolutePath = resolveStoredPath(submission.file_path);
        if (!absolutePath) {
            return res.status(500).json({ message: "The stored file path is invalid." });
        }

        try {
            await fs.promises.access(absolutePath, fs.constants.R_OK);
        } catch {
            return res.status(404).json({ message: "The submitted PDF file was not found." });
        }

        return res.download(absolutePath, submission.original_name);
    } catch (error) {
        console.error("Download assignment submission error:", error);
        return res.status(500).json({ message: "Failed to download the submission." });
    }
}
