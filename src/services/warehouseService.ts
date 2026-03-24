import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Warehouse model
export interface Warehouse {
  id: number;
  name: string;
  description: string;
  address: string;
  created_at: string;
  updated_at: string;
}

// Paginated response structure (matches your backend)
export interface PaginatedWarehouseResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Warehouse[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Fetch paginated warehouses (with optional search)
export async function fetchWarehouses(
  token: string,
  page: number = 1,
  search: string = ""
): Promise<PaginatedWarehouseResponse> {
  try {
    const { data } = await axios.get<PaginatedWarehouseResponse>(`${API_URL}/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        search,
      },
    });

    if (!data.success) {
      throw new Error("Failed to retrieve warehouses");
    }

    return data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to fetch warehouses";
    throw new Error(message);
  }
}

// Fetch paginated warehouses for staff (with optional search)
export async function fetchStaffWarehouses(
  token: string,
  page: number = 1,
  search: string = ""
): Promise<PaginatedWarehouseResponse> {
  try {
    const { data } = await axios.get<PaginatedWarehouseResponse>(`${API_URL}/locations/staff`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        search,
      },
    });

    if (!data.success) {
      throw new Error("Failed to retrieve warehouses");
    }

    return data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to fetch warehouses";
    throw new Error(message);
  }
}

// Create warehouse
export async function createWarehouse(
  token: string,
  warehouseData: { name: string; description?: string; address?: string }
): Promise<Warehouse> {
  try {
    const { data } = await axios.post<{ success: boolean; data: Warehouse }>(
      `${API_URL}/locations`,
      warehouseData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!data.success) throw new Error("Failed to create warehouse");

    return data.data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to create warehouse";
    throw new Error(message);
  }
}

// Update warehouse
export async function updateWarehouse(
  token: string,
  id: number,
  warehouseData: { name: string; description?: string; address?: string }
): Promise<Warehouse> {
  try {
    const { data } = await axios.post<{ success: boolean; data: Warehouse }>(
      `${API_URL}/locations/update/${id}`,
      warehouseData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!data.success) throw new Error("Failed to update warehouse");

    return data.data;
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to update warehouse";
    throw new Error(message);
  }
}

// Delete warehouse
export async function deleteWarehouse(token: string, id: number): Promise<void> {
  try {
    const { data } = await axios.delete<{ success: boolean }>(`${API_URL}/locations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data.success) throw new Error("Failed to delete warehouse");
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to delete warehouse";
    throw new Error(message);
  }
}
