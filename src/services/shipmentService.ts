import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchShipments(token: string, page = 1) {
  const { data } = await axios.get(`${API_URL}/shipments?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function createShipment(token: string, payload: any) {
  const { data } = await axios.post(`${API_URL}/shipments`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function fetchShipmentDetails(token: string, id: number) {
  const { data } = await axios.get(`${API_URL}/shipments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export const updateShipmentStatus = (token: string, id: number, status: string) => {
  return axios.patch(
    `${API_URL}/shipments/${id}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};