// src/config/navConfig.ts
import { FiHome, FiUsers, FiBox, FiClipboard, FiCheckCircle } from "react-icons/fi";

export const navConfig = {
  admin: [
    { label: "Dashboard", icon: FiHome, path: "/dashboard/admin" },
    { label: "Users", icon: FiUsers, path: "/dashboard/admin/users" },
    { label: "Projects", icon: FiBox, path: "/dashboard/admin/project" },
    { label: "Warehouses", icon: FiBox, path: "/dashboard/admin/warehouse" },
    { label: "Inventories", icon: FiBox, path: "/dashboard/admin/inventory" },
  ],

  project_manager: [
    { label: "Dashboard", icon: FiHome, path: "/dashboard/manager" },
    { label: "Projects", icon: FiClipboard, path: "/dashboard/manager/projects" },
    { label: "Requests", icon: FiCheckCircle, path: "projects/request/inventory/status" },
    { label: "Shipment", icon: FiBox, path: "/dashboard/manager/shipment" },
  ],

  warehouse_staff: [
    { label: "Dashboard", icon: FiHome, path: "/dashboard/warehouse" },
    { label: "Inventory", icon: FiBox, path: "/dashboard/warehouse/inventory" },
    { label: "Shipment", icon: FiBox, path: "/dashboard/warehouse/shipment" },
    { label: "Request", icon: FiBox, path: "/dashboard/warehouse/inventory/request" },
    { label: "Defected", icon: FiBox, path: "/dashboard/warehouse/inventory/defected" },
  ],
};
