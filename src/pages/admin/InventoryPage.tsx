import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

import {
  type Inventory,
  fetchInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  reorderInventory,
  mergeSingleReorder,
  mergeAllReorders,
} from "../../services/inventoryService";

import {
  type Warehouse,
  fetchWarehouses,
} from "../../services/warehouseService";

// Modals
import InventoryModal from "../../components/modals/InventoryModal";
import ConfirmModal from "../../components/modals/ConfirmModal";

// Toast
import { showToast } from "../../utils/toast";

export default function InventoryPage() {
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
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");

  // Reorder modal states
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [itemToReorder, setItemToReorder] = useState<Inventory | null>(null);
  const [reorderQty, setReorderQty] = useState<number>(0);
  const [reorderProcessing, setReorderProcessing] = useState(false);
  const [reorderHistory, setReorderHistory] = useState<
    { id: number; quantity: number; status: string; created_at: string }[]
  >([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch warehouses
  const loadWarehouses = async () => {
    if (!token) return;
    try {
      const res = await fetchWarehouses(token);
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
      const res = await fetchInventory(
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

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

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

  const filteredInventory = inventory.filter((item) => {
    if (stockFilter === "out") return item.quantity === 0;
    if (stockFilter === "low") return item.quantity > 0 && item.quantity <= 10;
    return true;
  });

  const openReorderModal = async (item: Inventory) => {
    setItemToReorder(item);
    setReorderQty(0);
    setShowReorderModal(true);

    setReorderHistory(item.reorders || []);
  };

  const handleReorderSubmit = async () => {
    if (!itemToReorder) return;
    if (reorderQty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }

    try {
      setReorderProcessing(true);
      console.log(itemToReorder.id, reorderQty);
      await reorderInventory(token!, itemToReorder.id, reorderQty);

      showToast(
        `Reordered ${reorderQty} units of ${itemToReorder.name}`,
        "success",
      );
      await loadInventory();
      setShowReorderModal(false);
    } catch (err: any) {
      showToast(err.message || "Failed to reorder", "error");
    } finally {
      setReorderProcessing(false);
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
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStockFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1 border border-primary rounded-lg text-sm ${
                stockFilter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              All
            </button>

            <button
              onClick={() => {
                setStockFilter("low");
                setPage(1);
              }}
              className={`px-3 py-1 border border-primary rounded-lg text-sm ${
                stockFilter === "low"
                  ? "bg-yellow-500 text-white"
                  : "bg-yellow-100 hover:bg-yellow-200"
              }`}
            >
              Low
            </button>

            <button
              onClick={() => {
                setStockFilter("out");
                setPage(1);
              }}
              className={`px-3 py-1 border border-primary rounded-lg text-sm ${
                stockFilter === "out"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 hover:bg-red-200"
              }`}
            >
              Out
            </button>
          </div>
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

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg"
      >
        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="md:hidden space-y-4 p-3">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item, i) => (
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

                  {/* Status */}
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

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 text-red-600 border border-red-600 rounded-lg py-1"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => openReorderModal(item)}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-1"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
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
              {filteredInventory.map((item, i) => (
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
                      <button onClick={() => handleEdit(item)}>
                        <FiEdit />
                      </button>
                      <button onClick={() => handleDelete(item.id)}>
                        <FiTrash2 />
                      </button>
                      <button
                        onClick={() => openReorderModal(item)}
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Reorder
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

      {/* Reorder Modal */}
      {showReorderModal && itemToReorder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Reorder Item</h2>
            <p className="mb-2">
              Enter quantity to reorder for <b>{itemToReorder.name}</b>:
            </p>
            <input
              type="number"
              min={1}
              value={reorderQty}
              onChange={(e) => setReorderQty(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => setShowReorderModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReorderSubmit}
                disabled={reorderProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                {reorderProcessing ? "Processing..." : "Reorder"}
              </button>
            </div>

            <h3 className="font-semibold mb-2">Reorder History</h3>
            {reorderHistory.length > 0 ? (
              <div className="flex flex-col gap-2">
                {reorderHistory.map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center p-2 border border-primary rounded"
                  >
                    <span>
                      <div>
                        {r.quantity} {itemToReorder.unit} -{" "}
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${
                          r.status === "merged"
                            ? "bg-gray-500"
                            : "bg-yellow-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </span>
                    <div className="flex gap-1">
                      {r.status === "pending" && (
                        <button
                          // For single merge
                          onClick={async () => {
                            if (!token || !itemToReorder) return;
                            try {
                              setReorderProcessing(true);
                              await mergeSingleReorder(token, r.id);
                              showToast("Merged successfully", "success");

                              // Reload inventory first
                              const res = await fetchInventory(
                                token,
                                page,
                                debouncedSearch,
                                selectedWarehouse,
                              );
                              setInventory(res.data.data);

                              // Reopen modal with fresh data
                              const updatedItem = res.data.data.find(
                                (i) => i.id === itemToReorder.id,
                              );
                              if (updatedItem) openReorderModal(updatedItem);
                            } catch {
                              showToast("Failed to merge", "error");
                            } finally {
                              setReorderProcessing(false);
                            }
                          }}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Arrived
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reorder history.</p>
            )}

            {reorderHistory.some((r) => r.status === "pending") && (
              <button
                // For merge all
                onClick={async () => {
                  if (!token || !itemToReorder) return;
                  try {
                    setReorderProcessing(true);
                    await mergeAllReorders(token, itemToReorder.id);
                    showToast("All pending reorders merged", "success");

                    // Reload inventory first
                    const res = await fetchInventory(
                      token,
                      page,
                      debouncedSearch,
                      selectedWarehouse,
                    );
                    setInventory(res.data.data);

                    // Reopen modal with fresh data
                    const updatedItem = res.data.data.find(
                      (i) => i.id === itemToReorder.id,
                    );
                    if (updatedItem) openReorderModal(updatedItem);
                  } catch {
                    showToast("Failed to merge all", "error");
                  } finally {
                    setReorderProcessing(false);
                  }
                }}
                className="mt-2 w-full px-4 py-2 bg-primary text-white rounded text-sm"
              >
                Merge All Pending
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
