// components/modals/WarehouseModal.tsx
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import { type User } from "../../services/userService";

interface WarehouseModalProps {
  show: boolean;
  mode: "add" | "edit";
  initialData?: {
    name: string;
    description: string;
    address: string;
    staff_id?: number;
  };
  staffList?: User[];
  processing?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    address: string;
    staff_id: number | null;
  }) => void;
}

export default function WarehouseModal({
  show,
  mode,
  initialData,
  staffList = [],
  processing = false,
  onClose,
  onSubmit,
}: WarehouseModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [selectedStaff, setSelectedStaff] = useState<number | null>(
    initialData?.staff_id || null
  );

  useEffect(() => {
    setName(initialData?.name || "");
    setDescription(initialData?.description || "");
    setAddress(initialData?.address || "");
    setSelectedStaff(initialData?.staff_id || null);
  }, [initialData]);

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelectedStaff(value);
  };

  const handleSubmit = () => {
    onSubmit({
      name,
      description,
      address,
      staff_id: selectedStaff,
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
          {mode === "add" ? "Add Warehouse" : "Edit Warehouse"}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Warehouse Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Single-select Staff dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-medium">Assign Staff:</label>
            <select
              value={selectedStaff ?? ""}
              onChange={handleStaffChange}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select staff</option>
              {staffList.length > 0 &&
                staffList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
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
            ? "Add Warehouse"
            : "Update Warehouse"}
        </button>
      </motion.div>
    </div>
  );
}
