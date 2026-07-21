import api from "./api";

export async function loginUser(username, password) {
    const response = await api.post("/auth/login", {
        username,
        password,
    });

    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/auth/me");

    return response.data;
}