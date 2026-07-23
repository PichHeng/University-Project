import api from "./api";

export async function getStudents() {
    const response = await api.get("/students");
    return response.data;
}

export async function createStudent(studentData) {
    const response = await api.post("/students", studentData);
    return response.data;
}

export async function updateStudent(studentId, studentData) {
    const response = await api.put(`/students/${studentId}`, studentData);
    return response.data;
}

export async function deleteStudent(studentId) {
    const response = await api.delete(`/students/${studentId}`);
    return response.data;
}

export async function getNextStudentCode() {
    const response = await api.get("/students/next-code");
    return response.data;
}

export async function getStudentGradesByYear(studentId) {
    const response = await api.get(`/students/${studentId}/grades-by-year`);
    return response.data;
}

export async function getMyStudentProfile() {
    const response = await api.get("/students/me");
    return response.data;
}
