import api from "./api";

export async function getAssignments() {
    const response = await api.get("/assignments");
    return response.data;
}

export async function createAssignment(payload) {
    const response = await api.post("/assignments", payload);
    return response.data;
}

export async function updateAssignment(id, payload) {
    const response = await api.put(`/assignments/${id}`, payload);
    return response.data;
}

export async function deleteAssignment(id) {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
}
