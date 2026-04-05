import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiInfo, FiCheck, FiX } from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";
import {
  fetchInventoryRequests,
} from "../../services/inventoryService";
import { fetchProjects } from "../../services/projectService";
import { showToast } from "../../utils/toast";
import { updateInventoryRequestStatus } from "../../services/inventoryRequest";

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
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editId, setEditId] = useState<number | null>(null);
  // const [editQty, setEditQty] = useState<number>(0);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<InventoryRequest | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

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
      const res = await fetchProjects(token);
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


  const confirmReject = (id: number) => {
    setSelectedRequestId(id);
    setShowRejectModal(true);
  };

  async function handleAction(
    requestId: number,
    action: "approved" | "rejected",
    reason?: string,
  ) {
    try {
      if (!token) return;
      const res = await updateInventoryRequestStatus(
        token,
        requestId,
        action,
        reason,
      );
      showToast(res.message, "success");
      await loadRequests();
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err: any) {
      showToast(err.message || "Action failed", "error");
    }
  }

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
        className="overflow-x-auto border rounded-lg"
      >
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
                  <td className="p-3 text-sm">{(page - 1) * 10 + i + 1}</td>
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
                  <td
                    className={`p-3 text-sm hidden md:table-cell font-semibold ${
                      req.status === "approved"
                        ? "text-green-600"
                        : req.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    <span className={`text-white ${
                        req.status === "approved"
                          ? "bg-green-600 p-1 px-2 rounded-xl text-xs"
                          : req.status === "pending"
                            ? "bg-yellow-600 p-1 px-2 rounded-xl text-xs"
                            : ""
                      }`}>
                    {req.status}

                    </span>
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {new Date(req.created_at).toLocaleString()}
                  </td>

                  <td className="p-3 text-sm">
                    <div className="flex justify-center gap-2">
                      {req.status === "pending" ? (
                        <>
                          <div className="relative group">
                            <button
                              onClick={() => handleAction(req.id, "approved")}
                              className="p-1 rounded-full text-white transition bg-green-600 hover:bg-green-700"
                            >
                              <FiCheck size={12} />
                            </button>
                          </div>

                          <div className="relative group">
                            <button
                              onClick={() => confirmReject(req.id)}
                              className="p-1 rounded-full text-white transition bg-red-600 hover:bg-red-700"
                            >
                              <FiX size={12} />
                            </button>
                          </div>
                        </>
                      ) : (
                        // ✅ Details Button if Approved or Rejected
                        <div className="relative group">
                          <button
                            onClick={() => handleDetails(req)} // open modal or navigate to details page
                            className="text-gray-700 hover:text-gray-900 transition-colors border p-1 rounded-md border-gray-600"
                          >
                            <FiInfo size={16} />
                          </button>
                          <span
                            className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
            bg-gray-800 text-white text-xs rounded py-1 px-2 
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          >
                            Details
                          </span>
                        </div>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-3 text-red-600">
              Reject Inventory Request
            </h2>
            <textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded p-2 h-24 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    showToast("Please provide a reason.", "error");
                    return;
                  }
                  handleAction(selectedRequestId!, "rejected", rejectReason);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Submit
              </button>
            </div>
          </div>
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
    </div>
  );
}
