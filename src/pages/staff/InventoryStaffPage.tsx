import { useState, useEffect } from "react";
import { FiEdit, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

import {
  type Inventory,
  fetchInventoryStaff,
  createInventory,
  updateInventory,
  deleteInventory,
} from "../../services/inventoryService";

import {
  type Warehouse,
  fetchStaffWarehouses,
} from "../../services/warehouseService";

// Modals
import InventoryModal from "../../components/modals/InventoryModal";
import ConfirmModal from "../../components/modals/ConfirmModal";

// Toast
import { showToast } from "../../utils/toast";

export default function InventoryStaffPage() {
  const { token } = useAuth();

  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [processing, setProcessing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch warehouses
  const loadWarehouses = async () => {
    if (!token) return;
    try {
      const res = await fetchStaffWarehouses(token);
      setWarehouses(res.data.data);
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    }
  };

  // Fetch inventory
  const loadInventory = async () => {
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchInventoryStaff(
        token,
        page,
        debouncedSearch,
        selectedWarehouse,
      );
      setInventory(res.data.data);
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
  }, [token]);

  useEffect(() => {
    loadInventory();
  }, [token, page, debouncedSearch, selectedWarehouse]);

  // Pagination
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  // Modal handlers
  const handleAdd = () => {
    setModalMode("add");
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (item: Inventory) => {
    setModalMode("edit");
    setSelectedItem(item);
    setShowModal(true);
  };

  // const handleDelete = (id: number) => {
  //   setItemToDelete(id);
  //   setShowDeleteModal(true);
  // };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteInventory(token!, itemToDelete);
      showToast("Inventory deleted successfully", "success");
      await loadInventory();
    } catch {
      showToast("Failed to delete inventory", "error");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setProcessing(true);
      if (modalMode === "add") {
        await createInventory(token!, data);
        showToast("Inventory added successfully", "success");
      } else if (modalMode === "edit" && selectedItem) {
        await updateInventory(token!, selectedItem.id, data);
        showToast("Inventory updated successfully", "success");
      }
      setShowModal(false);
      await loadInventory();
    } catch (err: any) {
      showToast(err.message || "Failed to save inventory", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Loader/Error
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
        >
          Loading inventories...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-primary w-full sm:w-auto">
          Manage Inventory
        </h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Warehouse Filter */}
          <select
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setPage(1);
            }}
            className="p-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FiPlus /> Item
          </button>
        </div>
      </div>

      {/* ================= WRAPPER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg"
      >
        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="md:hidden space-y-4 p-3">
          {inventory.length > 0 ? (
            inventory.map((item, i) => (
              <div
                key={item.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      #{(page - 1) * 10 + i + 1}
                    </p>
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                  </div>

                  {/* Stock Status */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      item.quantity === 0
                        ? "bg-red-600"
                        : item.quantity <= 10
                          ? "bg-yellow-600"
                          : "bg-green-600"
                    }`}
                  >
                    {item.quantity === 0
                      ? "Out of Stock"
                      : item.quantity <= 10
                        ? "Low"
                        : "In Stock"}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3 text-sm space-y-1">
                  <p>
                    <span className="font-medium">SKU:</span> {item.sku}
                  </p>

                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
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
                  </p>

                  <p>
                    <span className="font-medium">Reorder:</span>{" "}
                    {item.reorder_quantity > 0 ? (
                      <span className="text-blue-700 font-semibold">
                        {item.reorder_quantity} (Ordered)
                      </span>
                    ) : item.quantity === 0 ? (
                      <span className="text-red-600">Needs Order</span>
                    ) : (
                      "—"
                    )}
                  </p>

                  <p>
                    <span className="font-medium">Unit:</span> {item.unit}
                  </p>

                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {item.location?.name || "—"}
                  </p>

                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 text-blue-600 border border-blue-600 rounded-lg py-1"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              No inventory items found.
            </p>
          )}
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-neutralLight text-left">
              <tr>
                <th className="p-3 font-medium">#</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">SKU</th>
                <th className="p-3 font-medium">Quantity</th>
                <th className="p-3 font-medium">Reordered Qty</th>
                <th className="p-3 font-medium">Unit</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Created</th>
                <th className="p-3 font-medium text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((item, i) => (
                <tr key={item.id} className="border-t hover:bg-neutralLight">
                  <td className="p-3">{(page - 1) * 10 + i + 1}</td>

                  <td className="p-3 font-medium">{item.name}</td>

                  <td className="p-3">{item.sku}</td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
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

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantity === 0
                            ? "bg-red-100 text-red-700"
                            : item.quantity <= 10
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.quantity === 0
                          ? "Out of Stock"
                          : item.quantity <= 10
                            ? "Low"
                            : "In Stock"}
                      </span>
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    {item.reorder_quantity > 0 ? (
                      <div className="flex flex-col items-center text-xs">
                        <span className="font-semibold text-blue-700">
                          {item.reorder_quantity}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Ordered
                        </span>
                      </div>
                    ) : item.quantity === 0 ? (
                      <span className="text-red-600 text-xs font-medium">
                        Needs Order
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-3">{item.unit}</td>

                  <td className="p-3">{item.location?.name || "—"}</td>

                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiEdit size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-sm text-primary">
          Showing {inventory.length} items on page {page} of {totalPages}
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

      {/* Inventory Modal */}
      <InventoryModal
        show={showModal}
        mode={modalMode}
        warehouses={warehouses}
        initialData={selectedItem || undefined}
        processing={processing}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        show={showDeleteModal}
        message="Are you sure you want to delete this inventory item?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
