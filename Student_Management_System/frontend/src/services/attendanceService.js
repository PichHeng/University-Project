import api from "./api";

export async function getAttendance() {
    const response = await api.get("/attendance");
    return response.data;
}

export async function saveAttendance(payload) {
    const response = await api.put("/attendance", payload);
    return response.data;
}
