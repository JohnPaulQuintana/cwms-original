import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export interface DefectRequestsResponse {
  success: boolean;
  message: string;
  data: any;
}

export async function getDefectRequests(
  token: string,
  page: number = 1,
): Promise<DefectRequestsResponse> {
  const { data } = await axios.get<DefectRequestsResponse>(
    `${API_URL}/users/defect-items?page=${page}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!data.success) throw new Error("Failed to retrieve defect item requests");
  return data;
}

export async function postDefectRequests(
  token: string,
  shipment_id : number,
  inventory: any[],
  reason: string,
  status: "reject" | "return"
): Promise<DefectRequestsResponse> {
  const { data } = await axios.post<DefectRequestsResponse>(
    `${API_URL}/users/defect-items`,
    {shipment_id, inventory, reason, status},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.success) throw new Error("Failed to stored defect item requests");
  return data;
}