import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// import { getDefectRequests } from "../../services/defectService";
import {
  getReturnedRequests,
  approveReturnedItem,
  mergeReturnedItem,
  rejectReturnedItem
} from "../../services/returnedService";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";

export default function ReturnedPage() {
  const { token } = useAuth();
  const [returnItem, setReturnItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (token) loadReturned(page);
  }, [token, page, statusFilter]);

  async function loadReturned(pageNumber: number) {
    try {
      setLoading(true);

      const response = await getReturnedRequests(
        token!,
        pageNumber,
        statusFilter === "all" ? undefined : statusFilter,
      );

      const data = response.data;

      setReturnItems(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (item: any) => {
    if (!token) return;

    try {
      // call your API (you’ll implement this in backend)
      await approveReturnedItem(token, item.id);

      showToast("Return approved", "success");

      await loadReturned(page);
      // update UI
      setReturnItems((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: "approved" } : r)),
      );
    } catch (err: any) {
      showToast(err.message || "Failed to approve", "error");
    }
  };

  const handleMerge = async (item: any) => {
    if (!token) return;

    try {
      await mergeReturnedItem(token, item.id);

      showToast("Item merged to inventory", "success");
      await loadReturned(page);
      setReturnItems((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: "merged" } : r)),
      );
    } catch (err: any) {
      showToast(err.message || "Failed to merge", "error");
    }
  };

   const handleRejected = async (item: any) => {
    if (!token) return;

    try {
      await rejectReturnedItem(token, item.id);

      showToast("Item rejected to inventory", "success");
      await loadReturned(page);
      setReturnItems((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status: "rejected" } : r)),
      );
    } catch (err: any) {
      showToast(err.message || "Failed to merge", "error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Returned Items</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1); // reset page when filtering
              setStatusFilter(e.target.value);
            }}
            className="border px-3 py-2 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="merged">Merged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto border rounded-lg"
      >
        {loading ? (
          <p className="p-4 text-gray-500 text-center">
            Loading returned items...
          </p>
        ) : returnItem.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">
            No returned items found.
          </p>
        ) : (
          <table className="w-full border-collapse mt-2">
            <thead className="bg-neutralLight text-left">
              <tr>
                <th className="p-3 text-sm font-medium">Request ID</th>
                <th className="p-3 text-sm font-medium">Item Name</th>
                <th className="p-3 text-sm font-medium">Warehouse</th>
                <th className="p-3 text-sm font-medium">Quantity</th>
                <th className="p-3 text-sm font-medium">Unit</th>
                <th className="p-3 text-sm font-medium">Status</th>
                <th className="p-3 text-sm font-medium">Created At</th>
                <th className="p-3 text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {returnItem.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-mono">
                    {item.inventory_request_id || "-"}
                  </td>
                  <td className="p-3 text-sm font-semibold text-gray-800">
                    {item.inventory_name || "N/A"}
                  </td>
                  <td className="p-3 text-sm">{item.warehouse_name}</td>
                  <td className="p-3 text-sm text-gray-700">
                    <span
                      className={`${
                        item.quantity === 0
                          ? "text-red-700"
                          : item.quantity <= 10
                            ? "text-yellow-700"
                            : "text-green-700"
                      }`}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{item.unit}</td>
                  <td className="p-3 text-xs font-semibold uppercase">
                    <span
                      className={`${
                        item.status === "pending"
                          ? "text-yellow-600"
                          : item.status === "approved"
                            ? "text-green-600"
                            : item.status === "rejected"
                              ? "text-red-600"
                              : "text-green-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex gap-2">
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleApprove(item)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                      )}

                      {item.status === "approved" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMerge(item)}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Merge
                          </button>
                          <button
                            onClick={() => handleRejected(item)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Rejected
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
}
