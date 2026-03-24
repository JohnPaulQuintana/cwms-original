import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// types/User.ts
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  role: "admin" | "warehouse_staff" | "project_manager";
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsersResponse {
  success: boolean;
  type: "success" | "error";
  message: string;
  data: {
    current_page: number;
    data: User[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Axios instance (optional but cleaner)
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Fetch paginated users with search
export async function fetchUsers(
  token: string,
  page: number = 1,
  search: string = ""
): Promise<PaginatedUsersResponse> {
  try {
    const { data } = await api.get<PaginatedUsersResponse>(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        search,
      },
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to retrieve users");
    }

    return data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to fetch users";
    throw new Error(message);
  }
}

// Create a new user
export async function createUser(token: string, userData: any) {
  try {
    const { data } = await api.post(`${API_URL}/register`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to create user";
    throw new Error(message);
  }
}

// Update user
export async function updateUser(token: string, id: number, userData: any) {
  try {
    // console.log(userData)
    const { data } = await api.post(`${API_URL}/users/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to update user";
    throw new Error(message);
  }
}

// Delete user
export async function deleteUser(token: string, id: number) {
  try {
    const { data } = await api.delete(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to delete user";
    throw new Error(message);
  }
}

//get only the manager
export async function fetchManager(token:string) {
  try {
    const { data } = await api.get<PaginatedUsersResponse>(`${API_URL}/users/manager`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to retrieve managers");
    }

    return data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to fetch manager";
    throw new Error(message);
  }
}

//get only the manager
export async function fetchStaff(token:string) {
  try {
    const { data } = await api.get<PaginatedUsersResponse>(`${API_URL}/users/staff`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!data.success) {
      throw new Error(data.message || "Failed to retrieve staff");
    }

    return data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to fetch staff";
    throw new Error(message);
  }
}
