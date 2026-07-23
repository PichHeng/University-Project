import api from "./api";

export async function getAdminReports() {
    const response = await api.get("/reports/admin");
    return response.data;
}

export async function getTeacherReports() {
    const response = await api.get("/reports/teacher");
    return response.data;
}

export async function getStudentReports() {
    const response = await api.get("/reports/student");
    return response.data;
}

export async function getReportLogs() {
    const response = await api.get("/reports");
    return response.data;
}

export async function createReportLog(payload) {
    const response = await api.post("/reports", payload);
    return response.data;
}
