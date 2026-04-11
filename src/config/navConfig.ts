// src/config/navConfig.ts
import {
  FiHome,
  FiUsers,
  FiFolder,
  FiClipboard,
  // FiCheckCircle,
  FiPackage,
  FiTruck,
  FiAlertTriangle,
  FiLayers
} from "react-icons/fi";

export const navConfig = {
  admin: [
    { label: "Dashboard", icon: FiHome, path: "/dashboard/admin" },
    { label: "Users", icon: FiUsers, path: "/dashboard/admin/users" },
    { label: "Projects", icon: FiFolder, path: "/dashboard/admin/project" },
    { label: "Warehouses", icon: FiLayers, path: "/dashboard/admin/warehouse" },
    { label: "Inventory", icon: FiPackage, path: "/dashboard/admin/inventory" },
    { label: "Request", icon: FiClipboard, path: "/dashboard/admin/inventory/request" },
  ],

  project_manager: [
    { label: "Dashboard", icon: FiHome, path: "/dashboard/manager" },
    { label: "Project", icon: FiFolder, path: "/dashboard/manager/projects" },
    { label: "Request", icon: FiClipboard, path: "projects/request/inventory/status" },
    { label: "Shipment", icon: FiTruck, path: "/dashboard/manager/shipment" },
  ],

  warehouse_staff: [
    { label: "Dashboard", icon: FiHome, path: "/dashboard/warehouse" },
    { label: "Inventory", icon: FiPackage, path: "/dashboard/warehouse/inventory" },
    { label: "Shipment", icon: FiTruck, path: "/dashboard/warehouse/shipment" },
    { label: "Request", icon: FiClipboard, path: "/dashboard/warehouse/inventory/request" },
    { label: "Defected", icon: FiAlertTriangle, path: "/dashboard/warehouse/inventory/defected" },
    { label: "Returned", icon: FiAlertTriangle, path: "/dashboard/warehouse/inventory/returned" },
  ],
};