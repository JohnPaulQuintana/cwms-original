import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import {
  getInventoryRequests,
  updateInventoryRequestStatus,
} from "../../services/inventoryRequest";
import { showToast } from "../../utils/toast";

export default function WarehouseInventoryRequestsPage() {
  const { token } = useAuth();

  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

  // load requests on mount
  useEffect(() => {
    if (!token) return;
    loadRequests(page);
  }, [token, page]);

  // filter whenever status or requests change
  useEffect(() => {
    if (selectedStatus === "") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === selectedStatus));
    }
  }, [requests, selectedStatus]);

  const loadRequests = async (page = 1) => {
    if (!token) return;
    try {
      const res = await getInventoryRequests(token, page);
      const invData = res.data.inventory_requests;

      setRequests(invData.data);
      setPage(invData.current_page);
      setTotalPages(invData.last_page);
    } catch (err: any) {
      showToast(err.message || "Failed to load inventory requests", "error");
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

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Inventory Requests</h1>

        {/* 🔽 Status Filter Dropdown */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-2 border border-neutralLight rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
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
              <th className="w-[50px] p-3 text-sm font-medium">#</th>
              <th className="w-[100px] p-3 text-sm font-medium">
                Project Name
              </th>
              <th className="w-[100px] p-3 text-sm font-medium hidden sm:table-cell">
                Project Manager
              </th>
              <th className="w-[100px] p-3 text-sm font-medium hidden md:table-cell">
                Project Location
              </th>
              <th className="w-[100px] p-3 text-sm font-medium hidden lg:table-cell">
                Inventory Item
              </th>
              <th className="w-[100px] p-3 text-sm font-medium hidden lg:table-cell">
                Available Stocks
              </th>
              <th className="w-[100px] p-3 text-sm font-medium hidden md:table-cell">
                Requested Quantity
              </th>
              <th className="w-[100px] p-3 text-sm font-medium hidden md:table-cell">
                Status
              </th>
              <th className="p-3 text-sm font-medium hidden lg:table-cell">
                Requested At
              </th>
              <th className="p-3 text-sm font-medium text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req, index) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{index + 1 + (page - 1) * 10}</td>
                  <td className="p-3 text-sm">{req.project?.name || "—"}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">
                    {req.requester?.name || "—"}
                  </td>
                  <td className="p-3 text-sm hidden md:table-cell">
                    {req.project?.location || "—"}
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {req.inventory?.name || "—"}
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {req.inventory?.quantity || 0}
                  </td>
                  <td className="p-3 text-sm hidden md:table-cell">
                    {req.requested_qty}
                  </td>
                  <td
                    className={`text-white hidden md:table-cell font-semibold`}
                  >
                    <span
                      className={`${
                        req.status === "approved"
                          ? "bg-green-600 p-1 px-2 rounded-xl text-xs"
                          : req.status === "pending"
                            ? "bg-yellow-600 p-1 px-2 rounded-xl text-xs"
                            : ""
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  {/* <td className="p-3 text-center">
                    <span
                      className={`text-white px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === "approved"
                          ? "bg-green-600 p-1 px-2 rounded-xl text-xs"
                          : req.status === "pending"
                            ? "bg-yellow-600 p-1 px-2 rounded-xl text-xs"
                            : ""
                      }`}
                    >
                      {req.status === "approved"
                        ? "Approved by Admin"
                        : req.status === "rejected"
                          ? "Rejected by Admin"
                          : "Pending Approval"}
                    </span>
                  </td> */}
                  <td className="p-3 text-center flex items-center justify-center gap-2">
                    
                    <div className="relative group">
                      <button
                        onClick={() => handleAction(req.id, "approved")}
                        disabled={req.status !== "pending"}
                        className={`p-1 rounded-full text-white transition ${
                          req.status === "approved"
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <FiCheck size={12} />
                      </button>
                      <span
                        className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
                        text-xs text-white bg-gray-800 rounded py-1 px-2 opacity-0 
                        group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                      >
                        Approve
                      </span>
                    </div>

                    
                    <div className="relative group">
                      <button
                        onClick={() => confirmReject(req.id)}
                        disabled={req.status !== "pending"}
                        className={`p-1 rounded-full text-white transition ${
                          req.status !== "pending"
                            ? "bg-red-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <FiX size={12} />
                      </button>
                      <span
                        className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
                        text-xs text-white bg-gray-800 rounded py-1 px-2 opacity-0 
                        group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                      >
                        Reject
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  No inventory requests found.
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
    </div>
  );
}
