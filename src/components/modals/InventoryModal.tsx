import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import { type Warehouse } from "../../services/warehouseService";

interface InventoryModalProps {
  show: boolean;
  mode: "add" | "edit";
  warehouses?: Warehouse[];
  initialData?: {
    name: string;
    sku: string;
    description?: string;
    quantity: number;
    unit: string;
    location_id?: number;
  };
  processing?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    sku: string;
    description?: string;
    quantity: number;
    unit: string;
    location_id: number | null;
  }) => void;
}

export default function InventoryModal({
  show,
  mode,
  warehouses = [],
  initialData,
  processing = false,
  onClose,
  onSubmit,
}: InventoryModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [warehouseId, setWarehouseId] = useState<number | null>(
    initialData?.location_id || null
  );

  useEffect(() => {
    setName(initialData?.name || "");
    setSku(initialData?.sku || "");
    setDescription(initialData?.description || "");
    setQuantity(initialData?.quantity || 0);
    setUnit(initialData?.unit || "");
    setWarehouseId(initialData?.location_id || null);
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({
      name,
      sku,
      description,
      quantity,
      unit,
      location_id: warehouseId,
    });
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <motion.div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {mode === "add" ? "Add Inventory" : "Edit Inventory"}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Warehouse Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Assign Warehouse:</label>
            <select
              value={warehouseId || ""}
              onChange={(e) =>
                setWarehouseId(e.target.value ? Number(e.target.value) : null)
              }
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={processing}
          className="mt-4 w-full py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-300"
        >
          {processing
            ? "Saving..."
            : mode === "add"
            ? "Add Inventory"
            : "Update Inventory"}
        </button>
      </motion.div>
    </div>
  );
}
