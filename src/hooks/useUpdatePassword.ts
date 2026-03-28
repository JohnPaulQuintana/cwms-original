import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useUpdatePassword = () => {
  const { user, token, logoutUser } = useAuth();

  /**
   * Returns:
   * - true if password updated successfully (user should logout)
   * - false if update failed or validation failed
   */
  const updatePassword = async (payload: UpdatePasswordPayload): Promise<boolean> => {
    if (!user || !token) return false;

    // 🔒 Guard: check for empty fields
    if (!payload.currentPassword || !payload.newPassword || !payload.confirmPassword) {
      toast.error("All password fields are required");
      return false;
    }

    // ✅ Validate passwords match
    if (payload.newPassword !== payload.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/users/${user.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success(data.message || "Password updated successfully");

      // 🔐 Logout after password change
      logoutUser();

      return true;
    } catch (err: any) {
      toast.error(err.message || "Error updating password");
      return false;
    }
  };

  return { updatePassword };
};