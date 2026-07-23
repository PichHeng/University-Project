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

export async function getMyAvailableCourses() {
    const response = await api.get("/enrollments/student/available-courses");
    return response.data;
}

export async function enrollInCourse(courseId) {
    const response = await api.post("/enrollments/student/enroll", { courseId });
    return response.data;
}

export async function getMyEnrolledCourses() {
    const response = await api.get("/enrollments/student/my-courses");
    return response.data;
}
