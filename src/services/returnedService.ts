import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export interface ReturnedRequestsResponse {
  success: boolean;
  message: string;
  data: any;
}

export async function getReturnedRequests(
  token: string,
  page: number = 1,
  status?: string
): Promise<ReturnedRequestsResponse> {
  let url = `${API_URL}/users/returned-items?page=${page}`;

  if (status) {
    url += `&status=${status}`;
  }

  const { data } = await axios.get<ReturnedRequestsResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!data.success) throw new Error("Failed to retrieve returned items");

  return data;
}

export async function approveReturnedItem(
  token: string,
  id: number
): Promise<ReturnedRequestsResponse> {
  const { data } = await axios.post<ReturnedRequestsResponse>(
    `${API_URL}/users/returned-items/${id}/approved`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.success) throw new Error("Failed to approve returned item");
  return data;
}

export async function mergeReturnedItem(
  token: string,
  id: number
): Promise<ReturnedRequestsResponse> {
  const { data } = await axios.post<ReturnedRequestsResponse>(
    `${API_URL}/users/returned-items/${id}/merge`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.success) throw new Error("Failed to merge returned item");
  return data;
}