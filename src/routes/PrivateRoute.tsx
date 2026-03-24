import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode; // allows one or multiple children
  roles: ("admin" | "warehouse_staff" | "project_manager")[];
}

export const PrivateRoute = ({ children, roles }: PrivateRouteProps) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>; // safe wrapper
};
