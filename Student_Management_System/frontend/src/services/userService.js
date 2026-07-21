import api from "./api";

export async function getUsers() {
    const response = await api.get("/users");
    return response.data;
}

export async function createUser(userData) {
    const response = await api.post("/users", userData);
    return response.data;
}

export async function updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
}

export async function resetUserPassword(userId, newPassword) {
    const response = await api.patch(`/users/${userId}/reset-password`, {
        newPassword,
    });

    return response.data;
}

export async function deleteUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
}