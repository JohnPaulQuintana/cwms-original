import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiInfo } from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";
import {
  fetchInventoryRequests,
  deleteInventoryRequest,
  editInventoryRequest,
  returnInventoryRequest,
} from "../../services/inventoryService";
import { fetchMyProjects } from "../../services/projectService";
import { showToast } from "../../utils/toast";
// import { div } from "framer-motion/client";

type ReturnedItem = {
  id: number;
  quantity: number;
  status: "pending" | "approved"; // returned status
  created_at: string;
};

type InventoryRequest = {
  id: number;
  inventory_name: string;
  requested_qty: number;
  warehouse_name: string;
  unit: string;
  created_at: string;
  project_id: number;
  project_name: string;
  status: string;
  reject_reason?: string;
  returned_items?: ReturnedItem[];
};

type Project = {
  id: number;
  name: string;
};

export default function ProjectInventoryRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] =
    useState<keyof InventoryRequest>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const statusOptions = ["pending", "approved", "rejected"];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  const [selectedRequest, setSelectedRequest] =
    useState<InventoryRequest | null>(null);

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnRequest, setReturnRequest] = useState<InventoryRequest | null>(
    null,
  );
  const [returnQty, setReturnQty] = useState<number>(0);

  useEffect(() => {
    loadProjects();
  }, [token]);

  useEffect(() => {
    loadRequests();
  }, [token, selectedProject, page, sortField, sortOrder]);

  const handleDetails = (req: InventoryRequest) => {
    setSelectedRequest(req);
  };

  const loadProjects = async () => {
    if (!token) return;
    try {
      const res = await fetchMyProjects(token);
      setProjects(res.data.data);
    } catch (err: any) {
      showToast(err.message || "Failed to load projects", "error");
    }
  };

  const loadRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchInventoryRequests(
        token,
        selectedProject,
        page,
        sortField,
        sortOrder,
      );
      // console.log(res.data)
      setRequests(res.data.data);
      setTotalPages(res.data.last_page || 1);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
      showToast(err.message || "Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof InventoryRequest) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteInventoryRequest(token, id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      showToast("Request deleted successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete request", "error");
    }
  };

  const handleEdit = (id: number, qty: number) => {
    setEditId(id);
    setEditQty(qty);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!token || editId === null) return;
    try {
      await editInventoryRequest(token, editId, { requested_qty: editQty });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === editId ? { ...r, requested_qty: editQty } : r,
        ),
      );
      showToast("Quantity updated successfully", "success");
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || "Failed to update quantity", "error");
    }
  };

  const handleReturnClick = (req: InventoryRequest) => {
    setReturnRequest(req);
    setReturnQty(req.requested_qty); // default to full quantity
    setReturnModalOpen(true);
  };

  const maxReturnableQty = returnRequest
    ? returnRequest.requested_qty -
      (returnRequest.returned_items?.reduce((sum, r) => sum + r.quantity, 0) ||
        0)
    : 0;

  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-600">
        Loading requests...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500">
        {error}
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Inventory Requests</h1>

        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={selectedProject}
            onChange={(e) =>
              setSelectedProject(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="p-2 border border-neutralLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 border border-neutralLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg"
      >
        {/* ================= MOBILE VIEW ================= */}
        <div className="md:hidden">
          {requests.filter(
            (r) => !selectedStatus || r.status === selectedStatus,
          ).length === 0 ? (
            <p className="p-4 text-center text-gray-500">No requests found.</p>
          ) : (
            <div className="space-y-3 p-3">
              {requests
                .filter((r) => !selectedStatus || r.status === selectedStatus)
                .map((req, i) => (
                  <div
                    key={req.id}
                    className="border rounded-xl p-4 bg-white shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500">
                          #{i + 1 + (page - 1) * 10}
                        </p>
                        <p className="font-semibold text-sm">
                          {req.inventory_name}
                        </p>
                      </div>

                      {/* <span
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
                      </span> */}
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs ${
                          req.status === "approved"
                            ? "bg-green-600"
                            : req.status === "pending"
                              ? "bg-yellow-600"
                              : "bg-red-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-3 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Project:</span>{" "}
                        {req.project_name}
                      </p>

                      <p>
                        <span className="font-medium">Warehouse:</span>{" "}
                        {req.warehouse_name}
                      </p>

                      <p>
                        <span className="font-medium">Qty:</span>{" "}
                        {req.requested_qty} {req.unit}
                      </p>

                      <p>
                        <span className="font-medium">Date:</span>{" "}
                        {new Date(req.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {req.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handleEdit(req.id, req.requested_qty)
                            }
                            className="flex-1 border border-blue-600 text-blue-600 rounded-lg py-1"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(req.id)}
                            className="flex-1 border border-red-600 text-red-600 rounded-lg py-1"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDetails(req)}
                            className="flex-1 border border-gray-600 text-gray-700 rounded-lg py-1"
                          >
                            Details
                          </button>

                          {req.status === "approved" && (
                            <button
                              onClick={async () => {
                                handleReturnClick(req);
                                await loadRequests();
                              }}
                              className="flex-1 border border-yellow-500 text-yellow-600 rounded-lg py-1"
                            >
                              Return
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-neutralLight text-left">
              <tr>
                <th className="p-3 text-sm font-medium">#</th>

                <th
                  className="p-3 text-sm font-medium cursor-pointer"
                  onClick={() => handleSort("inventory_name")}
                >
                  Item
                </th>

                <th className="p-3 text-sm font-medium hidden sm:table-cell">
                  Project
                </th>

                <th className="p-3 text-sm font-medium hidden md:table-cell">
                  Warehouse
                </th>

                <th className="p-3 text-sm font-medium hidden lg:table-cell">
                  Quantity
                </th>

                <th className="p-3 text-sm font-medium hidden lg:table-cell">
                  Unit
                </th>

                <th className="p-3 text-sm font-medium hidden md:table-cell">
                  Status
                </th>

                <th
                  className="p-3 text-sm font-medium hidden lg:table-cell cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  Requested At
                </th>

                <th className="p-3 text-sm font-medium text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests
                .filter((r) => !selectedStatus || r.status === selectedStatus)
                .map((req, i) => (
                  <tr
                    key={req.id}
                    className="border-t hover:bg-neutralLight transition-colors"
                  >
                    <td className="p-3 text-sm">{i + 1 + (page - 1) * 10}</td>

                    <td className="p-3 text-sm font-medium">
                      {req.inventory_name}
                    </td>

                    <td className="p-3 text-sm hidden sm:table-cell">
                      {req.project_name}
                    </td>

                    <td className="p-3 text-sm hidden md:table-cell">
                      {req.warehouse_name}
                    </td>

                    <td className="p-3 text-sm hidden lg:table-cell">
                      {req.requested_qty}
                    </td>

                    <td className="p-3 text-sm hidden lg:table-cell">
                      {req.unit}
                    </td>

                    <td className="p-3 text-sm hidden md:table-cell font-semibold">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          req.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : req.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>

                    <td className="p-3 text-sm hidden lg:table-cell">
                      {new Date(req.created_at).toLocaleString()}
                    </td>

                    <td className="p-3 text-sm">
                      <div className="flex justify-center gap-2">
                        {/* Pending Actions */}
                        {req.status === "pending" ? (
                          <>
                            <button
                              onClick={() =>
                                handleEdit(req.id, req.requested_qty)
                              }
                              className="text-blue-600 border p-1 rounded-md border-blue-600"
                            >
                              <FiEdit size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(req.id)}
                              className="text-red-600 border p-1 rounded-md border-red-600"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDetails(req)}
                              className="text-gray-700 border p-1 rounded-md border-gray-600"
                            >
                              <FiInfo size={16} />
                            </button>

                            {req.status === "approved" && (
                              <button
                                onClick={async () => {
                                  handleReturnClick(req);
                                  await loadRequests();
                                }}
                                className="text-yellow-600 border p-1 rounded-md border-yellow-500"
                              >
                                Return
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {requests.filter(
                (r) => !selectedStatus || r.status === selectedStatus,
              ).length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-gray-500 text-sm"
                  >
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Edit Quantity
            </h2>
            <input
              type="number"
              value={editQty}
              onChange={(e) => setEditQty(Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              min={1}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Request Details
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Item:</strong> {selectedRequest.inventory_name}
              </p>
              <p>
                <strong>Project:</strong> {selectedRequest.project_name}
              </p>
              <p>
                <strong>Warehouse:</strong> {selectedRequest.warehouse_name}
              </p>
              <p>
                <strong>Quantity:</strong> {selectedRequest.requested_qty}{" "}
                {selectedRequest.unit}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    selectedRequest.status === "approved"
                      ? "text-green-600"
                      : selectedRequest.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </p>

              {selectedRequest.status === "rejected" && (
                <div className="mt-3">
                  <p className="font-semibold text-red-600">
                    Rejection Reason:
                  </p>
                  <p className="text-gray-700 bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                    {selectedRequest.reject_reason || "No reason provided."}
                  </p>
                </div>
              )}

              <p>
                <strong>Requested At:</strong>{" "}
                {new Date(selectedRequest.created_at).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {returnModalOpen && returnRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md"
          >
            <h2 className="text-xl font-semibold mb-4 text-primary">
              Return Item
            </h2>

            <p className="mb-2">
              <strong>Item:</strong> {returnRequest.inventory_name}
            </p>
            <p className="mb-4">
              <strong>Project:</strong> {returnRequest.project_name}
            </p>

            <input
              type="number"
              min={1}
              // max={returnRequest.requested_qty}
              max={maxReturnableQty}
              value={returnQty}
              onChange={(e) => {
                const val = Number(e.target.value);
                // make sure it doesn't go above max
                setReturnQty(Math.min(Math.max(val, 1), maxReturnableQty));
              }}
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500">
              Max returnable quantity: {maxReturnableQty}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!returnRequest) return;
                  // Calculate remaining returnable quantity
                  const alreadyReturned =
                    returnRequest.returned_items?.reduce(
                      (sum, r) => sum + r.quantity,
                      0,
                    ) || 0;
                  const maxReturnableQty =
                    returnRequest.requested_qty - alreadyReturned;

                  if (returnQty < 1 || returnQty > maxReturnableQty) {
                    showToast(
                      `You can return only 1 to ${maxReturnableQty} items`,
                      "error",
                    );
                    return;
                  }

                  try {
                    console.log(returnRequest, returnQty);
                    if (!token) return; // skip if not logged in
                    await returnInventoryRequest(token, {
                      inventory_request_id: returnRequest.id,
                      inventory_name: returnRequest.inventory_name,
                      project_id: returnRequest.project_id,
                      warehouse_name: returnRequest.warehouse_name,
                      quantity: returnQty,
                      unit: returnRequest.unit,
                    });
                    showToast(
                      `Return processed for ${returnRequest.inventory_name}`,
                      "success",
                    );
                    setReturnModalOpen(false);
                    // Optional: refresh the list or update local state
                    await loadRequests();
                  } catch (err: any) {
                    showToast(
                      err.message || "Failed to process return",
                      "error",
                    );
                  }
                }}
                className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Confirm Return
              </button>
            </div>

            {returnRequest.returned_items &&
              returnRequest.returned_items.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-lg text-primary">
                    Returned History
                  </h3>
                  <ul className="text-sm border rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {returnRequest.returned_items.map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 border-b last:border-b-0 py-2 px-1 hover:bg-gray-100 transition-colors rounded-md"
                      >
                        <span className="font-medium">Qty: {r.quantity}</span>

                        <span className="flex items-center gap-2">
                          Status:
                          <span
                            className={`px-2 py-0.5 rounded-full text-white font-semibold text-xs ${
                              r.status === "approved"
                                ? "bg-green-600"
                                : r.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                            }`}
                          >
                            {r.status.charAt(0).toUpperCase() +
                              r.status.slice(1)}
                          </span>
                        </span>

                        <span className="text-gray-500 text-xs sm:text-sm">
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
