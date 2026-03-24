import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

interface PublicRouteProps {
  children: JSX.Element;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user } = useAuth();

  if (user) {
    // Redirect logged-in users to their dashboard
    switch (user.role) {
      case "admin":
        return <Navigate to="/dashboard/admin" replace />;
      case "warehouse_staff":
        return <Navigate to="/dashboard/warehouse" replace />;
      case "project_manager":
        return <Navigate to="/dashboard/manager" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children; // Not logged in → render login / forgot password
};
