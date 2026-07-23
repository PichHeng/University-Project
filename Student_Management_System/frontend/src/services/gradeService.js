import api from "./api";

export async function getTeacherGradeCourses() {
    const response = await api.get("/grades/teacher/courses");
    return response.data;
}

export async function getTeacherCourseStudents(courseId) {
    const response = await api.get(`/grades/teacher/course/${courseId}/students`);
    return response.data;
}

export async function saveTeacherGrade(data) {
    const response = await api.post("/grades/teacher", data);
    return response.data;
}

export async function saveTeacherGradesBulk(grades) {
    const response = await api.post("/grades/teacher/bulk", { grades });
    return response.data;
}

export async function getMyStudentGrades() {
    const response = await api.get("/grades/student/me");
    return response.data;
}
