import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

import {
  type Inventory,
  fetchInventory,
  sendInventoryRequest,
} from "../../services/inventoryService";
import {
  type Warehouse,
  fetchWarehouses,
} from "../../services/warehouseService";
import { showToast } from "../../utils/toast";
import QuantityModal from "../../components/modals/QuantityModal";

type RequestedItem = Inventory & { requestedQty: number };
type LocationState = {
  projectId?: number;
};

export default function ProjectRequestInventoryPage() {
  const { token } = useAuth();
  const location = useLocation() as { state: LocationState }; // cast the type
  const projectId = location.state?.projectId;
  // console.log(projectId)
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Request list
  const [requestList, setRequestList] = useState<RequestedItem[]>([]);

  // Modal state
  const [showQtyModal, setShowQtyModal] = useState(false);
  const [modalItem, setModalItem] = useState<RequestedItem | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load warehouses
  const loadWarehouses = async () => {
    if (!token) return;
    try {
      const res = await fetchWarehouses(token);
      setWarehouses(res.data.data);
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    }
  };

  // Load inventory
  const loadInventory = async () => {
    if (!token) return;
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

  // Open modal for Add/Edit quantity
  const handleOpenModal = (item: Inventory) => {
    if (!selectedWarehouse) {
      showToast("Please select a warehouse first", "error");
      return;
    }
    const existing = requestList.find((i) => i.id === item.id);
    setModalItem(existing || { ...item, requestedQty: 1 });
    setModalQty(existing ? existing.requestedQty : 1);
    setShowQtyModal(true);
  };

  // Confirm quantity selection
  const handleConfirmQty = () => {
    if (!modalItem) return;
    setRequestList((prev) => {
      const exists = prev.find((i) => i.id === modalItem.id);
      if (exists)
        return prev.map((i) =>
          i.id === modalItem.id ? { ...i, requestedQty: modalQty } : i,
        );
      return [...prev, { ...modalItem, requestedQty: modalQty }];
    });
    setShowQtyModal(false);
    setModalItem(null);
    setModalQty(1);
  };

  const handleRemoveItem = (id: number) => {
    setRequestList(requestList.filter((i) => i.id !== id));
  };

  const handleSubmitAll = async () => {
    if (!requestList.length) {
      showToast("No items selected", "error");
      return;
    }
    if (!selectedWarehouse) {
      showToast("Please select a warehouse", "error");
      return;
    }
    try {
      await sendInventoryRequest(
        token!,
        // Number(selectedWarehouse),
        Number(projectId),
        requestList.map((i) => ({
          inventory_id: i.id,
          warehouse_id: i.location_id,
          requested_qty: i.requestedQty,
        })),
      );
      console.log("Submitting request:", requestList);
      showToast("Inventory request submitted successfully!", "success");
      setRequestList([]);
    } catch (err: any) {
      showToast(err.message || "Failed to submit request", "error");
    }
  };

  // console.log(warehouses)
  if (loading)
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Loading...
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
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-primary w-full sm:w-auto">
          Request Inventory
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
              <option
                key={wh.id}
                value={wh.id}
                disabled={!wh.staff_id} // disable if no staff_id
                className={!wh.staff_id ? "text-gray-400" : ""}
              >
                {wh.name}{!wh.staff_id ? " - Not Available" : ""}
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
        </div>
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto border rounded-lg"
      >
        <table className="w-full border-collapse text-sm">
          <thead className="bg-neutralLight text-left">
            <tr>
              <th className="p-3 font-medium">#</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium hidden sm:table-cell">SKU</th>
              <th className="p-3 font-medium hidden md:table-cell">Quantity</th>
              <th className="p-3 font-medium hidden lg:table-cell">Unit</th>
              <th className="p-3 font-medium hidden xl:table-cell">Location</th>
              <th className="p-3 font-medium hidden 2xl:table-cell">Created</th>
              <th className="p-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length > 0 ? (
              inventory.map((item, i) => {
                const inRequest = requestList.find((r) => r.id === item.id);
                return (
                  <tr key={item.id} className="border-t hover:bg-neutralLight">
                    <td className="p-3">{(page - 1) * 10 + i + 1}</td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 hidden sm:table-cell">{item.sku}</td>
                    <td className="p-3 hidden md:table-cell">
                      {item.quantity}
                    </td>
                    <td className="p-3 hidden lg:table-cell">{item.unit}</td>
                    <td className="p-3 hidden xl:table-cell">
                      {item.location?.name || "—"}
                    </td>
                    <td className="p-3 hidden 2xl:table-cell">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className={`px-3 py-1 rounded ${
                          inRequest
                            ? "bg-yellow-400 hover:bg-yellow-500"
                            : "bg-blue-500 hover:bg-blue-700"
                        } text-white`}
                      >
                        {inRequest ? "Edit" : "Add"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-500">
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-300 hover:bg-primary-dark"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-300 hover:bg-primary-dark"
          >
            Next
          </button>
        </div>
      </div>

      {/* Requested Items Summary & Submit */}
      {requestList.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-bold text-lg mb-3 text-primary ">
            Requested Items:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {requestList.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white border shadow-sm rounded p-3"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-primary">
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    Warehouse: {item.location?.name || "—"}
                  </span>
                  <span className="text-sm text-gray-500">
                    Available: {item.quantity} {item.unit}
                  </span>
                  <span className="text-sm text-gray-600">
                    Requested: {item.requestedQty}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-2 px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmitAll}
            className="mt-4 w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded transition-colors"
          >
            Submit All
          </button>
        </div>
      )}

      {/* Quantity Modal */}
      {modalItem && (
        <QuantityModal
          show={showQtyModal}
          itemName={modalItem.name}
          quantity={modalQty}
          maxQuantity={modalItem.quantity}
          onChange={setModalQty}
          onClose={() => setShowQtyModal(false)}
          onConfirm={handleConfirmQty}
        />
      )}
    </div>
  );
}
