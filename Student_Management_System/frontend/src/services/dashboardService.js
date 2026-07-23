import api from "./api";

export async function getAdminDashboard() {
    const response = await api.get("/reports/admin-dashboard");
    return response.data;
}

export async function getTeacherDashboard() {
    const response = await api.get("/reports/teacher-dashboard");
    return response.data;
}

export async function getStudentDashboard() {
    const response = await api.get("/reports/student-dashboard");
    return response.data;
}
