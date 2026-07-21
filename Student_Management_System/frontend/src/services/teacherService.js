import api from "./api";

export async function getTeachers() {
    const response = await api.get("/teachers");
    return response.data;
}

export async function createTeacher(teacherData) {
    const response = await api.post("/teachers", teacherData);
    return response.data;
}

export async function updateTeacher(teacherId, teacherData) {
    const response = await api.put(`/teachers/${teacherId}`, teacherData);
    return response.data;
}

export async function deleteTeacher(teacherId) {
    const response = await api.delete(`/teachers/${teacherId}`);
    return response.data;
}