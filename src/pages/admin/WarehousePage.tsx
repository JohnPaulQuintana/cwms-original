import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { FaFileAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  type Warehouse,
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../../services/warehouseService";

import { type User, fetchStaff } from "../../services/userService";

// Modals
import WarehouseModal from "../../components/modals/WarehouseModal";
import ConfirmModal from "../../components/modals/ConfirmModal";

// Toast
import { showToast } from "../../utils/toast";

import { useNavigate } from "react-router-dom";

export default function WarehousesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [staff, setStaffs] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null
  );
  const [processing, setProcessing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<number | null>(
    null
  );

  // 🔁 Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch warehouses
  const loadWarehouses = async () => {
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWarehouses(token, page, debouncedSearch);
      const res_staff = await fetchStaff(token);
      setWarehouses(res.data.data);
      setStaffs(res_staff.data.data || []);
      setTotalPages(res.data.last_page);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [token, page, debouncedSearch]);

  // Pagination handlers
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  // Modal handlers
  const handleAdd = () => {
    setModalMode("add");
    setSelectedWarehouse(null);
    setShowModal(true);
  };

  const handleEdit = (wh: Warehouse) => {
    setModalMode("edit");
    setSelectedWarehouse(wh);
    setShowModal(true);
  };

  //handle records
  const handleRecords = (wh: Warehouse) => {
    // Implement the logic to view warehouse records tracking
    console.log(wh)
    navigate(`/dashboard/admin/records`, { state: { wh } });
    // showToast(`Viewing records for warehouse: ${wh.name}`, "info");
  };

  const handleDelete = (id: number) => {
    setWarehouseToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!warehouseToDelete) return;
    try {
      await deleteWarehouse(token!, warehouseToDelete);
      showToast("Warehouse deleted successfully", "success");
      await loadWarehouses();
    } catch {
      showToast("Failed to delete warehouse", "error");
    } finally {
      setShowDeleteModal(false);
      setWarehouseToDelete(null);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setProcessing(true);
      if (modalMode === "add") {
        await createWarehouse(token!, formData);
        showToast("Warehouse added successfully", "success");
      } else if (modalMode === "edit" && selectedWarehouse) {
        await updateWarehouse(token!, selectedWarehouse.id, formData);
        showToast("Warehouse updated successfully", "success");
      }
      setShowModal(false);
      await loadWarehouses();
    } catch (err: any) {
      showToast(err.message || "Failed to save warehouse", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-primary">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <motion.p
          className="mt-4 text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          Loading warehouses...
        </motion.p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Manage Warehouses</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 p-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FiPlus size={18} /> Warehouse
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-neutralLight text-left">
            <tr>
              <th className="p-3 text-sm font-medium">#</th>
              <th className="p-3 text-sm font-medium">Name</th>
              <th className="p-3 text-sm font-medium">Description</th>
              <th className="p-3 text-sm font-medium hidden sm:table-cell">
                Address
              </th>
              <th className="p-3 text-sm font-medium hidden lg:table-cell">
                Created At
              </th>
              <th className="p-3 text-sm font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.length > 0 ? (
              warehouses.map((wh, i) => (
                <tr key={wh.id} className="border-t hover:bg-neutralLight">
                  <td className="p-3 text-sm">{(page - 1) * 10 + i + 1}</td>
                  <td className="p-3 text-sm font-medium">{wh.name}</td>
                  <td className="p-3 text-sm">{wh.description}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">
                    {wh.address}
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {new Date(wh.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex justify-center gap-2">

                      <button
                        title="Warehouse Records"
                        onClick={() => handleRecords(wh)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <FaFileAlt size={16} />
                      </button>
                      <button
                        title="Edit Warehouse"
                        onClick={() => handleEdit(wh)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        title="Delete Warehouse"
                        onClick={() => handleDelete(wh.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 py-4 text-sm"
                >
                  No warehouses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-sm text-primary">
          Showing {warehouses.length} warehouses on page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-300 hover:bg-primary-dark transition-colors text-sm"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-300 hover:bg-primary-dark transition-colors text-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* Warehouse Modal */}
      <WarehouseModal
        show={showModal}
        mode={modalMode}
        initialData={selectedWarehouse || undefined}
        staffList={staff} // Pass the staff array here
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        processing={processing}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={showDeleteModal}
        message="Are you sure you want to delete this warehouse?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
