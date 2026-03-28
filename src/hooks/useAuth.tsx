import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
const API_URL = import.meta.env.VITE_API_URL;

type Role = "admin" | "warehouse_staff" | "project_manager";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: number;
  admin_approval?: boolean;
}

interface JWTPayload {
  exp: number;
  iat?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  adminApproval: boolean; // 🔹 expose as state
  loginUser: (user: User, token: string, admin_approval: boolean) => void;
  logoutUser: () => void;
  loginError: string | null;
  setLoginError: (msg: string | null) => void;
  updateProfileInfo: (updated: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminApproval, setAdminApproval] = useState<boolean>(false); // 🔹 new state
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔹 Restore session on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedApproval = localStorage.getItem("admin_approval");

    if (storedUser && storedToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(storedToken);
        const now = Date.now() / 1000;

        if (decoded.exp > now) {
          const parsedUser = JSON.parse(storedUser);
          const approval = storedApproval ? JSON.parse(storedApproval) : false;

          parsedUser.admin_approval = approval; // update user object
          setUser(parsedUser);
          setToken(storedToken);
          setAdminApproval(approval); // set state separately
        } else {
          toast.error("Session expired. Please log in again.");
          logoutUser();
        }
      } catch {
        toast.error("Invalid token. Please log in again.");
        logoutUser();
      }
    }
  }, []);

  // 🔁 Auto check token expiration every 30s
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          toast.error("Session expired. Please log in again.");
          logoutUser();
          navigate("/login");
        }
      } catch {
        toast.error("Authentication error. Please log in again.");
        logoutUser();
        navigate("/login");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [token, navigate]);

  // 🔐 Login
  const loginUser = (user: User, token: string, admin_approval: boolean) => {
    const updatedUser = { ...user, admin_approval }; // merge admin_approval into user

    setUser(updatedUser);
    setToken(token);
    setAdminApproval(admin_approval); // 🔹 set state

    localStorage.setItem("user", JSON.stringify(updatedUser));
    localStorage.setItem("token", token);
    localStorage.setItem("admin_approval", JSON.stringify(admin_approval));
    setLoginError(null);

    if (admin_approval) {
      toast("Waiting for admin approval to access features", {
        icon: "⚠️",
      });
    }
  };

  const updateProfileInfo = async (
    updated: Partial<User>,
  ): Promise<boolean> => {
    if (!user || !token) return false;

    // ✅ Optional: guard against empty inputs
    if (updated.name === "" || updated.email === "") {
      toast.error("Name and email cannot be empty");
      return false;
    }
    
    // 🔍 Check if anything actually changed
    const hasChanges =
      (updated.name && updated.name !== user.name) ||
      (updated.email && updated.email !== user.email);

    if (!hasChanges) {
      toast("No changes detected", { icon: "ℹ️" });
      return false; // ❌ nothing to update
    }

    

    try {
      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      setUser(data.data);
      localStorage.setItem("user", JSON.stringify(data.data));
      toast.success("Profile updated successfully");

      return true; // ✅ success
    } catch (err: any) {
      toast.error(err.message || "Error updating profile");
      return false; // ❌ failed
    }
  };

  // 🚪 Logout
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setAdminApproval(false); // reset approval state
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_approval");
    setLoginError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        adminApproval, // 🔹 exposed here
        loginUser,
        logoutUser,
        loginError,
        setLoginError,
        updateProfileInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔧 Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
