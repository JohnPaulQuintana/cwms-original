import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  fetchShipments,
  updateShipmentStatus,
} from "../../services/shipmentService";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import { FaTruck, FaCheckCircle, FaShippingFast } from "react-icons/fa";

export default function ShipmentsPage() {
  const { token } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (token) loadShipments(page);
  }, [token, page]);

  async function loadShipments(p = 1) {
    try {
      const res = await fetchShipments(token!, p);
      const shipments = res.data.data;

      // ✅ Group shipments by project_id
      const grouped = shipments.reduce((acc: any, shipment: any) => {
        const projectId = shipment.project.id;
        if (!acc[projectId]) {
          acc[projectId] = {
            project: shipment.project,
            shipments: [],
          };
        }
        acc[projectId].shipments.push(shipment);
        return acc;
      }, {});

      setShipments(Object.values(grouped));
      setTotalPages(res.data.last_page);
    } catch (err: any) {
      showToast(err.message || "Failed to load shipments", "error");
    }
  }

  async function handleStatusUpdate(id: number, status: string) {
    try {
      await updateShipmentStatus(token!, id, status);
      showToast(`Shipment marked as ${status}`, "success");
      loadShipments(page); // refresh list
    } catch (err: any) {
      showToast(err.message || "Failed to update shipment", "error");
    }
  }

  // ✅ Apply filter by status (pending/shipped/delivered)
  const filteredShipments = selectedStatus
    ? shipments
        .map((group) => ({
          ...group,
          shipments: group.shipments.filter(
            (s: any) => s.status === selectedStatus
          ),
        }))
        .filter((group) => group.shipments.length > 0)
    : shipments;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Shipments</h1>

        {/* 🔽 Status Filter Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border border-neutralLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Table */}
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="border rounded-lg"
>
  {/* ================= MOBILE VIEW ================= */}
  <div className="md:hidden">
    {filteredShipments.length === 0 ? (
      <p className="p-4 text-gray-500 text-center">
        No shipments found.
      </p>
    ) : (
      filteredShipments.map((group: any) => (
        <div key={group.project.id} className="mb-6">
          {/* Project Header */}
          <div className="bg-gray-100 p-3 rounded-lg mb-3">
            <h2 className="text-lg font-semibold text-primary">
              {group.project.name}
            </h2>
            <p className="text-sm text-gray-600">
              {group.project.location}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last Shipment:{" "}
              {new Date(
                group.shipments[group.shipments.length - 1]?.created_at
              ).toLocaleString()}
            </p>
          </div>

          {/* Shipment Cards */}
          <div className="space-y-3">
            {group.shipments.map((s: any) => (
              <div
                key={s.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      Tracking #
                    </p>
                    <p className="font-mono font-semibold text-sm">
                      {s.tracking_number}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      s.status === "pending"
                        ? "bg-yellow-600"
                        : s.status === "in_transit"
                        ? "bg-blue-600"
                        : s.status === "shipped"
                        ? "bg-indigo-600"
                        : "bg-green-600"
                    }`}
                  >
                    {s.status.replace("_", " ")}
                  </span>
                </div>

                {/* Progress */}
                <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-700 ${
                      s.status === "pending"
                        ? "bg-yellow-500 w-1/4"
                        : s.status === "in_transit"
                        ? "bg-blue-500 w-2/4 animate-pulse"
                        : s.status === "shipped"
                        ? "bg-indigo-500 w-3/4"
                        : s.status === "delivered"
                        ? "bg-green-500 w-full"
                        : "bg-gray-400 w-0"
                    }`}
                  />
                </div>

                {/* Items */}
                <div className="mt-3 text-sm space-y-1">
                  <p className="font-medium">Items:</p>
                  {s.items.map((it: any) => (
                    <div key={it.id}>
                      <span className="font-semibold">
                        {it.inventory_request.inventory.name}
                      </span>{" "}
                      ({it.quantity}{" "}
                      {it.inventory_request.inventory.unit})
                    </div>
                  ))}
                </div>

                {/* Created By */}
                <p className="text-sm mt-2">
                  <span className="font-medium">By:</span>{" "}
                  {s.user?.name}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {s.status === "pending" ? (
                    <button
                      onClick={() =>
                        handleStatusUpdate(s.id, "in_transit")
                      }
                      className="flex-1 bg-blue-600 text-white rounded-lg py-1"
                    >
                      Ship
                    </button>
                  ) : s.status === "in_transit" ? (
                    <button
                      onClick={() =>
                        handleStatusUpdate(s.id, "delivered")
                      }
                      className="flex-1 bg-green-600 text-white rounded-lg py-1"
                    >
                      Deliver
                    </button>
                  ) : (
                    <span className="flex-1 text-center text-green-600 font-semibold">
                      Delivered
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))
    )}
  </div>

  {/* ================= DESKTOP TABLE ================= */}
  <div className="hidden md:block overflow-x-auto">
    {filteredShipments.length === 0 ? (
      <p className="p-4 text-gray-500 text-center">
        No shipments found.
      </p>
    ) : (
      filteredShipments.map((group: any) => (
        <div
          key={group.project.id}
          className="border-b border-gray-200 mb-6"
        >
          {/* Project Header */}
          <div className="bg-gray-100 p-3 rounded-t flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                {group.project.name}
              </h2>
              <p className="text-sm text-gray-600">
                {group.project.location}
              </p>
            </div>

            <p className="text-sm text-gray-500 mt-2 sm:mt-0">
              <span className="font-medium text-gray-700">
                Last Shipment:
              </span>{" "}
              {new Date(
                group.shipments[group.shipments.length - 1]?.created_at
              ).toLocaleString()}
            </p>
          </div>

          {/* Table */}
          <table className="w-full border-collapse mt-2">
            <thead className="bg-neutralLight text-left">
              <tr>
                <th className="p-3 text-sm font-medium">Tracking #</th>
                <th className="p-3 text-sm font-medium">Items</th>
                <th className="p-3 text-sm font-medium">Status</th>
                <th className="p-3 text-sm font-medium">Created By</th>
                <th className="p-3 text-sm font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {group.shipments.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-mono">
                    {s.tracking_number}
                  </td>

                  <td className="p-3 text-sm">
                    {s.items.map((it: any) => (
                      <div key={it.id} className="mb-1">
                        <span className="font-semibold">
                          {it.inventory_request.inventory.name}
                        </span>{" "}
                        ({it.quantity}{" "}
                        {it.inventory_request.inventory.unit})
                      </div>
                    ))}
                  </td>

                  <td className="p-3 text-xs font-semibold uppercase">
                    <div
                      className={`${
                        s.status === "pending"
                          ? "text-yellow-600"
                          : s.status === "in_transit"
                          ? "text-blue-600"
                          : s.status === "shipped"
                          ? "text-indigo-600"
                          : "text-green-600"
                      }`}
                    >
                      {s.status.replace("_", " ")}
                    </div>

                    <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                      <div
                        className={`h-2 transition-all duration-700 ${
                          s.status === "pending"
                            ? "bg-yellow-500 w-1/4"
                            : s.status === "in_transit"
                            ? "bg-blue-500 w-2/4 animate-pulse"
                            : s.status === "shipped"
                            ? "bg-indigo-500 w-3/4"
                            : s.status === "delivered"
                            ? "bg-green-500 w-full"
                            : "bg-gray-400 w-0"
                        }`}
                      />
                    </div>
                  </td>

                  <td className="p-3 text-sm">{s.user?.name}</td>

                  <td className="p-3 text-sm text-center">
                    {s.status === "pending" ? (
                      <button
                        onClick={() =>
                          handleStatusUpdate(s.id, "in_transit")
                        }
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                      >
                        <FaShippingFast size={18} />
                      </button>
                    ) : s.status === "in_transit" ? (
                      <button
                        onClick={() =>
                          handleStatusUpdate(s.id, "delivered")
                        }
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                      >
                        <FaTruck size={18} />
                      </button>
                    ) : (
                      <span className="text-green-600 flex justify-center">
                        <FaCheckCircle size={20} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))
    )}
  </div>
</motion.div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300 hover:bg-primary-dark"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300 hover:bg-primary-dark"
        >
          Next
        </button>
      </div>
    </div>
  );
}
