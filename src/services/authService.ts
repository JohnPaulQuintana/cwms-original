import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
// console.log(API_URL);

interface LoginResponse {
  success: boolean;
  type: string;
  message: string;
  data: { user: any; token: string } | null;
}

// const axiosClient = axios.create({
//   baseURL: `${API_URL}/api`,
//   withCredentials: true, // ⚠️ Required for Sanctum or session-based auth
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });
// send api login call
export async function login(email: string, password: string) {
  try {
    const { data } = await axios.post<LoginResponse>(`${API_URL}/login`, { email, password });

    if (!data.success || !data.data) {
      // Throw error with server message
      throw new Error(data.message || "Login failed");
    }

    return data.data; // { user, token }
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Login failed";
    throw new Error(message);
  }
}

//send forgot password api call
export async function forgotPassword(email: string) {
  try {
    const { data } = await axios.post(`${API_URL}/forgot-password`, { email });
    return data.message || "Password reset link sent!";
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || "Failed to send reset link";
    throw new Error(message);
  }
}
