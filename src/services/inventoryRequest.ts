import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

// 👇 User model
export interface User {
  id: number;
  name: string;
  email?: string;
  role: string;
  created_at?: string;
  warehouse_locations: number[];
}

// 👇 Requester and Project submodels
export interface Requester {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Inventory {
  id: number;
  name: string;
  sku: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface Project {
  id: number;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
}

// 👇 Inventory Request model
export interface InventoryRequest {
  id: number;
  inventory_id: number;
  warehouse_id: number;
  requested_qty: number;
  requested_by: number;
  project_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  requester: Requester;
  inventory: Inventory;
  project: Project;
}

// 👇 Paginated wrapper
export interface PaginatedInventoryRequests {
  current_page: number;
  data: InventoryRequest[];
  last_page: number;
  total: number;
}

// 👇 Response structure
export interface InventoryRequestsResponse {
  success: boolean;
  data: User & {
    inventory_requests: PaginatedInventoryRequests;
  };
}

export interface InventoryActionResponse {
  success: boolean;
  message: string;
  data: InventoryRequest;
}


export async function getInventoryRequests(
  token: string,
  page = 1
): Promise<InventoryRequestsResponse> {
  const { data } = await axios.get<InventoryRequestsResponse>(
    `${API_URL}/users/staff/requests?page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.success) throw new Error("Failed to retrieve inventory requests");
  return data;
}

export async function updateInventoryRequestStatus(
  token: string,
  id: number,
  action: "approved" | "rejected",
  reason?: string
): Promise<InventoryActionResponse> {
  return await axios.post(
    `${API_URL}/users/inventory-requests/${id}/action`,
    { action, reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}


