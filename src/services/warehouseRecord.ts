import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export interface WarehouseRecordRequestsResponse {
  success: boolean;
  message: string;
  data: any;
}

export async function getWarehouseRecordRequests(
  token: string,
  page: number = 1,
  id: number
): Promise<WarehouseRecordRequestsResponse> {
  const { data } = await axios.get<WarehouseRecordRequestsResponse>(
    `${API_URL}/locations/${id}/records/?page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!data.success) throw new Error("Failed to retrieve warehouse records requests");
  return data;
}