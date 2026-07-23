import api from "./api";

export async function getDepartments() {
    const response = await api.get("/departments");
    return response.data;
}

export async function createDepartment(departmentData) {
    const response = await api.post("/departments", departmentData);
    return response.data;
}

export async function updateDepartment(departmentId, departmentData) {
    const response = await api.put(`/departments/${departmentId}`, departmentData);
    return response.data;
}

export async function deleteDepartment(departmentId) {
    const response = await api.delete(`/departments/${departmentId}`);
    return response.data;
}

export async function getDepartmentDetails(departmentId) {
    const response = await api.get(`/departments/${departmentId}/details`);
    return response.data;
}
