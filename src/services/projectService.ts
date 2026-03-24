import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Project model
export interface ProjectManager {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  manager_id: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  manager?: ProjectManager;
}

// Paginated response structure
export interface PaginatedProjectsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Project[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Fetch paginated projects
export async function fetchProjects(
  token: string,
  search: string = "",
  page: number = 1,
  per_page: number = 10
): Promise<PaginatedProjectsResponse> {
  try {
    const { data } = await api.get<PaginatedProjectsResponse>(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        search,
        page,
        per_page,
      },
    });

    if (!data.success) {
      throw new Error("Failed to retrieve projects");
    }

    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to fetch projects";
    throw new Error(message);
  }
}

// Fetch paginated projects
export async function fetchMyProjects(
  token: string,
  search: string = "",
  page: number = 1,
  per_page: number = 10
): Promise<PaginatedProjectsResponse> {
  try {
    const { data } = await api.get<PaginatedProjectsResponse>(`${API_URL}/my-projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        search,
        page,
        per_page,
      },
    });

    if (!data.success) {
      throw new Error("Failed to retrieve projects");
    }

    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to fetch projects";
    throw new Error(message);
  }
}

// Create a new project
export async function createProject(token: string, userData: any) {
  try {
    const { data } = await api.post(`${API_URL}/projects`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to create project";
    throw new Error(message);
  }
}

// Update project
export async function updateProject(token: string, id: number, userData: any) {
  try {
    const { data } = await api.post(`${API_URL}/projects/update/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to update project";
    throw new Error(message);
  }
}

// Delete project
export async function deleteProject(token: string, id: number) {
  try {
    const { data } = await api.delete(`${API_URL}/projects/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Failed to delete project";
    throw new Error(message);
  }
}
