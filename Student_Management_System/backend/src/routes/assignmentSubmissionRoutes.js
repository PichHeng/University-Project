import express from "express";
import multer from "multer";

import {
    downloadSubmission,
    getAssignmentSubmissionsForTeacher,
    getMySubmissionForAssignment,
    getMySubmissions,
    maxUploadMb,
    saveTeacherFeedback,
    submitAssignment,
    uploadAssignmentPdf,
} from "../controllers/assignmentSubmissionController.js";
import protect from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

function handlePdfUpload(req, res, next) {
    uploadAssignmentPdf.single("pdf")(req, res, (error) => {
        if (!error) return next();

        if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: `PDF is too large. Maximum upload size is ${maxUploadMb} MB.`,
            });
        }

        return res.status(400).json({
            message: error.message || "PDF upload failed.",
        });
    });
}

router.use(protect);

router.post(
    "/student/:assignmentId",
    allowRoles("student"),
    handlePdfUpload,
    submitAssignment
);
router.get("/student/me", allowRoles("student"), getMySubmissions);
router.get(
    "/student/assignment/:assignmentId",
    allowRoles("student"),
    getMySubmissionForAssignment
);
router.get(
    "/teacher/assignment/:assignmentId",
    allowRoles("teacher"),
    getAssignmentSubmissionsForTeacher
);
router.patch(
    "/teacher/:submissionId/feedback",
    allowRoles("teacher"),
    saveTeacherFeedback
);
router.get(
    "/:submissionId/download",
    allowRoles("student", "teacher", "admin"),
    downloadSubmission
);

export default router;
