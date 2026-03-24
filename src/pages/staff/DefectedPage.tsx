import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDefectRequests } from "../../services/defectService";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";

export default function DefectedPage() {
  const { token } = useAuth();
  const [defects, setDefects] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) loadDefected(page);
  }, [token, page]);

  async function loadDefected(pageNumber: number) {
    try {
      setLoading(true);
      const response = await getDefectRequests(token!, pageNumber);
      const data = response.data;

      setDefects(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Defected Items</h1>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto border rounded-lg"
      >
        {loading ? (
          <p className="p-4 text-gray-500 text-center">Loading defected items...</p>
        ) : defects.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No defected items found.</p>
        ) : (
          <table className="w-full border-collapse mt-2">
            <thead className="bg-neutralLight text-left">
              <tr>
                <th className="p-3 text-sm font-medium">Tracking #</th>
                <th className="p-3 text-sm font-medium">Item</th>
                <th className="p-3 text-sm font-medium">Quantity</th>
                <th className="p-3 text-sm font-medium">Reason</th>
                <th className="p-3 text-sm font-medium">Status</th>
                <th className="p-3 text-sm font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {defects.map((defect) => (
                <tr key={defect.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-mono">
                    {defect.shipment?.tracking_number || "-"}
                  </td>
                  <td className="p-3 text-sm font-semibold text-gray-800">
                    {defect.inventory?.name || "N/A"}
                  </td>
                  <td className="p-3 text-sm">{defect.quantity}</td>
                  <td className="p-3 text-sm text-gray-700">{defect.reason}</td>
                  <td className="p-3 text-xs font-semibold uppercase">
                    <span
                      className={`${
                        defect.status === "reject"
                          ? "text-red-600"
                          : defect.status === "returned"
                          ? "text-yellow-600"
                          : "text-gray-700"
                      }`}
                    >
                      {defect.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(defect.created_at).toLocaleString()}
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
