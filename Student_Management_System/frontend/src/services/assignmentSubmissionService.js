import api from "./api";

export function submitAssignment(assignmentId, formData) {
    return api.post(`/assignment-submissions/student/${assignmentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export function getMySubmissions() {
    return api.get("/assignment-submissions/student/me");
}

export function getMySubmissionForAssignment(assignmentId) {
    return api.get(`/assignment-submissions/student/assignment/${assignmentId}`);
}

export function getAssignmentSubmissionsForTeacher(assignmentId) {
    return api.get(`/assignment-submissions/teacher/assignment/${assignmentId}`);
}

export function saveTeacherFeedback(submissionId, teacherFeedback) {
    return api.patch(`/assignment-submissions/teacher/${submissionId}/feedback`, {
        teacher_feedback: teacherFeedback,
    });
}

export async function downloadSubmission(submissionId, filename) {
    const response = await api.get(
        `/assignment-submissions/${submissionId}/download`,
        { responseType: "blob" }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename || `assignment-submission-${submissionId}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
}

export async function viewSubmission(submissionId) {
    const previewWindow = window.open("", "_blank");

    try {
        const response = await api.get(
            `/assignment-submissions/${submissionId}/download`,
            { responseType: "blob" }
        );
        const fileUrl = window.URL.createObjectURL(
            new Blob([response.data], { type: "application/pdf" })
        );

        if (previewWindow) {
            previewWindow.location.href = fileUrl;
        } else {
            const anchor = document.createElement("a");
            anchor.href = fileUrl;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
        }

        window.setTimeout(() => window.URL.revokeObjectURL(fileUrl), 60_000);
    } catch (error) {
        previewWindow?.close();
        throw error;
    }
}
