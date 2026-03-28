import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../hooks/useAuth";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";

import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import WarehouseDashboard from "../pages/dashboard/WarehouseDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";

import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import WarehousePage from "../pages/admin/WarehousePage";
import InventoryPage from "../pages/admin/InventoryPage";
import InventoryStaffPage from "../pages/staff/InventoryStaffPage";
import ProjectPage from "../pages/admin/ProjectPage";
import ProjectManagerPage from "../pages/manager/ProjectManagerPage";
import ProjectRequestInventoryPage from "../pages/manager/ProjectRequestInventoryPage";
import ProjectInventoryRequestsPage from "../pages/manager/ProjectInventoryRequestsPage";
import WarehouseInventoryRequestsPage from "../pages/staff/WarehouseRequestInventory";
import ShipmentsPage from "../pages/staff/ShipmentsPage";
import ProjectShipmentsPage from "../pages/manager/ProjectShipmentsPage";
import DefectedPage from "../pages/staff/DefectedPage";
import WarehouseRecord from "../pages/admin/records/WarehouseRecord";
import RegisterPage from "../pages/auth/RegisterPage";
export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Admin Routes (Nested) */}
          <Route
            path="/dashboard/admin"
            element={
              <PrivateRoute roles={["admin"]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="project" element={<ProjectPage />} />
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="records" element={<WarehouseRecord />} />
          </Route>

          {/* Other Roles */}
          <Route
            path="/dashboard/warehouse"
            element={
              <PrivateRoute roles={["warehouse_staff"]}>
                <AdminLayout />
              </PrivateRoute>
            }>
            <Route index element={<WarehouseDashboard />} />
            <Route path="inventory" element={<InventoryStaffPage />}></Route>
            <Route path="inventory/request" element={<WarehouseInventoryRequestsPage />}></Route>
            <Route path="shipment" element={<ShipmentsPage />}></Route>
            <Route path="inventory/defected" element={<DefectedPage />}></Route>
          </Route>

          <Route
            path="/dashboard/manager"
            element={
              <PrivateRoute roles={["project_manager"]}>
                <AdminLayout />
              </PrivateRoute>
            }>
              <Route index element={<ManagerDashboard />} />
              <Route path="projects" element={<ProjectManagerPage />} />
              <Route path="projects/request/inventory" element={<ProjectRequestInventoryPage />} />
              <Route path="projects/request/inventory/status" element={<ProjectInventoryRequestsPage />} />
              <Route path="shipment" element={<ProjectShipmentsPage />}></Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
