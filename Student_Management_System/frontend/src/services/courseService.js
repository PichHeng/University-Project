import api from "./api";

export async function getCourses() {
    const response = await api.get("/courses");
    return response.data;
}

export async function createCourse(courseData) {
    const response = await api.post("/courses", courseData);
    return response.data;
}

export async function updateCourse(courseId, courseData) {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
}

export async function deleteCourse(courseId) {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
}