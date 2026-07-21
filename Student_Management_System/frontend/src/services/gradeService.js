import api from "./api";

export async function getGrades() {
    const response = await api.get("/grades");
    return response.data;
}

export async function saveGrade(payload) {
    const response = await api.put("/grades", payload);
    return response.data;
}
