import api from "./api";

export async function getReportLogs() {
    const response = await api.get("/reports");
    return response.data;
}

export async function createReportLog(payload) {
    const response = await api.post("/reports", payload);
    return response.data;
}
