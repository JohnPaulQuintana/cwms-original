import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  fetchShipments,
  updateShipmentStatus,
} from "../../services/shipmentService";

import { postDefectRequests } from "../../services/defectService";

import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import { FaTruck } from "react-icons/fa";

export default function ProjectShipmentsPage() {
  const { token } = useAuth();
  const [shipments, setShipments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectQty, setRejectQty] = useState(0);
  const [maxQty, setMaxQty] = useState(0);

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

  // handle marking shipment as delivered
  async function handleDelivered(id: number, shipment: any, status: string) {
    try {
      console.log(id, shipment);
      //commented for now to avoid accidental updates
      await updateShipmentStatus(token!, id, status);
      showToast(`Shipment marked as ${status}`, "success");
      loadShipments(page); // refresh list
    } catch (err: any) {
      showToast(err.message || "Failed to update shipment", "error");
    }
  }

  // async function handleReject(id: number, shipment: any, status: string) {
  //   try {
  //     console.log(id, shipment);

  //     //need to send tracking number, inventory id, status and reason for returned or rejected
  //     await postDefectRequests(
  //       token!,
  //       id,
  //       shipment.items.map((it: any) => ({
  //         inventory_id: it.inventory_request.inventory.id,
  //         quantity: it.inventory_request.requested_qty, //requested quantity from inventory request
  //       })),
  //       "Items returned from shipment",
  //       "reject"
  //     );

  //     //commented for now to avoid accidental updates
  //     await updateShipmentStatus(token!, id, status);
  //     showToast(`Shipment marked as ${status}`, "success");
  //     loadShipments(page); // refresh list
  //   } catch (err: any) {
  //     showToast(err.message || "Failed to update shipment", "error");
  //   }
  // }

  // ✅ Apply filter by status (pending/shipped/delivered)
  const filteredShipments = selectedStatus
    ? shipments
        .map((group) => ({
          ...group,
          shipments: group.shipments.filter(
            (s: any) => s.status === selectedStatus,
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
        className="overflow-x-auto border rounded-lg"
      >
        {filteredShipments.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No shipments found.</p>
        ) : (
          filteredShipments.map((group: any) => (
            <div
              key={group.project.id}
              className="border-b border-gray-200 mb-6"
            >
              {/* 🏗️ Project Header */}
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
                    group.shipments[group.shipments.length - 1]?.created_at,
                  ).toLocaleString()}
                </p>
              </div>

              {/* ================= MOBILE CARDS ================= */}
              <div className="sm:hidden space-y-3 p-3">
                {group.shipments.map((s: any) => (
                  <div
                    key={s.id}
                    className="border rounded-lg p-3 bg-white shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-sm">
                        {s.tracking_number}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs ${
                          s.status === "pending"
                            ? "bg-yellow-500"
                            : s.status === "in_transit"
                              ? "bg-blue-500"
                              : s.status === "shipped"
                                ? "bg-indigo-500"
                                : s.status === "delivered"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                        }`}
                      >
                        {s.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-semibold">Items:</span>
                        {s.items.map((it: any) => (
                          <div key={it.id} className="text-gray-700">
                            {it.inventory_request.inventory.name} ({it.quantity}{" "}
                            {it.inventory_request.inventory.unit})
                          </div>
                        ))}
                      </div>

                      <div>
                        <span className="font-semibold">Created By:</span>{" "}
                        {s.user?.name}
                      </div>

                      {/* Progress */}
                      <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                        <div
                          className={`h-2 transition-all duration-700 ease-in-out ${
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

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        {s.status === "in_transit" && (
                          <>
                            <button
                              onClick={() =>
                                handleDelivered(s.id, s, "delivered")
                              }
                              className="flex-1 p-2 bg-green-500 text-white rounded"
                            >
                              Deliver
                            </button>

                            <button
                              onClick={() => {
                                setSelectedShipment(s);
                                setShowRejectModal(true);
                                const totalQty = s.items.reduce(
                                  (sum: number, it: any) =>
                                    sum + it.inventory_request.requested_qty,
                                  0,
                                );
                                setMaxQty(totalQty);
                              }}
                              className="flex-1 p-2 bg-red-500 text-white rounded"
                            >
                              Return
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= DESKTOP TABLE ================= */}
              <div className="hidden sm:block">
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
                            <div key={it.id}>
                              <span className="font-semibold">
                                {it.inventory_request.inventory.name}
                              </span>{" "}
                              ({it.quantity}{" "}
                              {it.inventory_request.inventory.unit})
                            </div>
                          ))}
                        </td>

                        <td className="p-3 text-xs font-semibold uppercase">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              s.status === "pending"
                                ? "text-yellow-500"
                                : s.status === "in_transit"
                                  ? "text-blue-500"
                                  : s.status === "shipped"
                                    ? "text-indigo-500"
                                    : s.status === "delivered"
                                      ? "text-green-500"
                                      : "text-gray-500"
                            }`}
                          >
                            {s.status.replace("_", " ")}
                          </span>

                          <div className="w-full bg-gray-200 h-2 rounded mt-2 overflow-hidden">
                            <div
                              className={`h-2 transition-all duration-700 ease-in-out ${
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

                        <td className="p-3 text-center">
                          {s.status === "in_transit" && (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() =>
                                  handleDelivered(s.id, s, "delivered")
                                }
                                className="p-2 bg-green-500 text-white rounded-full"
                              >
                                <FaTruck size={18} />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedShipment(s);
                                  setShowRejectModal(true);
                                  const totalQty = s.items.reduce(
                                    (sum: number, it: any) =>
                                      sum + it.inventory_request.requested_qty,
                                    0,
                                  );
                                  setMaxQty(totalQty);
                                }}
                                className="p-2 bg-red-500 text-white rounded-full"
                              >
                                <FaTruck size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
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

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Reject Shipment
            </h2>

            <label className="block mb-3">
              <span className="text-sm text-gray-600">Reason</span>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection"
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-gray-600">
                Quantity to Reject (max {maxQty})
              </span>
              <input
                type="number"
                value={rejectQty}
                onChange={(e) =>
                  setRejectQty(Math.min(Number(e.target.value), maxQty))
                }
                max={maxQty}
                min={1}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!rejectReason.trim()) {
                    showToast("Please provide a reason.", "error");
                    return;
                  }
                  if (rejectQty <= 0) {
                    showToast("Please enter a valid quantity.", "error");
                    return;
                  }

                  try {
                    const s = selectedShipment;

                    await postDefectRequests(
                      token!,
                      s.id,
                      s.items.map((it: any) => ({
                        inventory_id: it.inventory_request.inventory.id,
                        quantity: rejectQty, // user input
                        tracking_number: s.tracking_number,
                      })),
                      rejectReason,
                      "reject",
                    );

                    await updateShipmentStatus(token!, s.id, "delivered");
                    showToast("Shipment marked as rejected.", "success");
                    setShowRejectModal(false);
                    loadShipments(page);
                  } catch (err: any) {
                    showToast(
                      err.message || "Failed to reject shipment",
                      "error",
                    );
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
