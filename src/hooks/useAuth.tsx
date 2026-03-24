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

type Role = "admin" | "warehouse_staff" | "project_manager";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  is_active: number;
}

interface JWTPayload {
  exp: number;
  iat?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginUser: (user: User, token: string) => void;
  logoutUser: () => void;
  loginError: string | null;
  setLoginError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔹 Restore session on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(storedToken);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
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
  const loginUser = (user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setLoginError(null);
  };

  // 🚪 Logout
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoginError(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loginUser, logoutUser, loginError, setLoginError }}
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
