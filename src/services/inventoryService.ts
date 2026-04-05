// services/inventoryService.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Warehouse (Location) model
export interface Location {
  id: number;
  name: string;
  description: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Reorder {
  id: number;
  quantity: number;
  status: "pending" | "merged" | string;
  created_at: string;
}

// Inventory model
export interface Inventory {
  id: number;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  reorder_quantity: number;
  unit: string;
  location_id: number;
  created_at: string;
  updated_at: string;
  location: Location;
  reorders?: Reorder[];
}

// Paginated response structure
export interface PaginatedInventoryResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Inventory[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Fetch paginated inventory (with optional search)
export async function fetchInventory(
  token: string,
  page: number = 1,
  search: string = "",
  warehouseId: string = "",
): Promise<PaginatedInventoryResponse> {
  const { data } = await axios.get<PaginatedInventoryResponse>(
    `${API_URL}/inventory`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, search, warehouse_id: warehouseId },
    },
  );

  if (!data.success) throw new Error("Failed to retrieve inventory");
  return data;
}

// Fetch paginated inventory staff (with optional search)
export async function fetchInventoryStaff(
  token: string,
  page: number = 1,
  search: string = "",
  warehouseId: string = "",
): Promise<PaginatedInventoryResponse> {
  const { data } = await axios.get<PaginatedInventoryResponse>(
    `${API_URL}/inventory/staff`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, search, warehouse_id: warehouseId },
    },
  );

  if (!data.success) throw new Error("Failed to retrieve inventory");
  return data;
}

// Add new inventory
export async function createInventory(
  token: string,
  payload: {
    name: string;
    sku: string;
    description?: string;
    quantity: number;
    unit: string;
    warehouse_id: number;
  },
): Promise<Inventory> {
  console.log(payload);
  const { data } = await axios.post(`${API_URL}/inventory`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data.success) throw new Error("Failed to create inventory item");
  return data.data;
}

// Update existing inventory
export async function updateInventory(
  token: string,
  id: number,
  payload: {
    name: string;
    sku: string;
    description?: string;
    quantity: number;
    unit: string;
    warehouse_id: number;
  },
): Promise<Inventory> {
  const { data } = await axios.post(
    `${API_URL}/inventory/update/${id}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!data.success) throw new Error("Failed to update inventory item");
  return data.data;
}

// Delete inventory
export async function deleteInventory(
  token: string,
  id: number,
): Promise<void> {
  const { data } = await axios.delete(`${API_URL}/inventory/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data.success) throw new Error("Failed to delete inventory item");
}

// Send an Inventory Requests
export async function sendInventoryRequest(
  token: string,
  project_id: number,
  items: {
    inventory_id: number;
    warehouse_id: number;
    requested_qty: number;
  }[],
) {
  try {
    const response = await axios.post(
      `${API_URL}/inventory/request`,
      {
        project_id,
        items,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data; // return backend response
  } catch (err: any) {
    console.error(
      "Error sending inventory request:",
      err.response?.data || err.message,
    );
    throw new Error(
      err.response?.data?.error || "Failed to send inventory request",
    );
  }
}

// get Inventory Request
export async function fetchInventoryRequests(
  token: string,
  projectId?: number | "",
  page: number = 1,
  sortField: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
) {
  let url = `${API_URL}/inventory/request/status?page=${page}&sort_field=${sortField}&sort_order=${sortOrder}`;
  if (projectId) url += `&project_id=${projectId}`;

  return axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Delete an inventory request
export async function deleteInventoryRequest(token: string, requestId: number) {
  return axios.delete(`${API_URL}/inventory/request/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Edit/update an inventory request
export async function editInventoryRequest(
  token: string,
  requestId: number,
  data: { requested_qty?: number; warehouse_id?: number },
) {
  return axios.post(`${API_URL}/inventory/request/update/${requestId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function reorderInventory(
  token: string,
  id: number,
  quantity: number,
): Promise<Inventory> {
  const { data } = await axios.post(
    `${API_URL}/inventory/reorder/${id}`,
    { quantity },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!data.success) throw new Error("Failed to reorder inventory");
  return data.data;
}

export const mergeSingleReorder = async (token: string, reorderId: number) => {
  await fetch(`${API_URL}/inventory/merge-single/${reorderId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const mergeAllReorders = async (token: string, inventoryId: number) => {
  await fetch(`${API_URL}/inventory/merge-all/${inventoryId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Process a returned inventory request
export async function returnInventoryRequest(
  token: string,
  payload: {
    inventory_request_id: number;
    inventory_name: string;
    project_id: number;
    warehouse_name: string;
    quantity: number;
    unit: string;
  },
) {
  try {
    const { data } = await axios.post(`${API_URL}/inventory/return`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!data.success) throw new Error("Failed to process return");
    return data.data;
  } catch (err: any) {
    console.error("Error processing return:", err.response?.data || err.message);
    throw new Error(err.response?.data?.error || "Failed to process return");
  }
}
