import api from "./api";

export async function getEnrollments() {
    const response = await api.get("/enrollments");
    return response.data;
}

export async function createEnrollment(enrollmentData) {
    const response = await api.post("/enrollments", enrollmentData);
    return response.data;
}

export async function updateEnrollment(enrollmentId, enrollmentData) {
    const response = await api.put(`/enrollments/${enrollmentId}`, enrollmentData);
    return response.data;
}

export async function deleteEnrollment(enrollmentId) {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
}