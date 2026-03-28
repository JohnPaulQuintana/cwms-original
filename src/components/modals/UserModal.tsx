import { useState, useEffect } from "react";

interface UserModalProps {
  show: boolean;
  mode: "add" | "edit";
  initialData?: {
    name: string;
    email: string;
    role: string;
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role: string;
  }) => Promise<void> | void;
  processing?: boolean;
}

export default function UserModal({
  show,
  mode,
  initialData,
  onClose,
  onSubmit,
  processing = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "warehouse_staff",
  });

  // Prefill data if editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: "",
        role: initialData.role,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "warehouse_staff",
      });
    }
  }, [mode, initialData]);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email)
      return alert("Name and email are required.");
    await onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          {mode === "add" && (
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
            />
          )}
          <select
            value={formData.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            {/* <option value="admin">Admin</option> */}
            <option value="warehouse_staff">Warehouse Staff</option>
            <option value="project_manager">Project Manager</option>
          </select>
        </div>

        <div className="flex justify-end mt-5 gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300"
          >
            {processing
              ? "Saving..."
              : mode === "add"
              ? "Add User"
              : "Update User"}
          </button>
        </div>
      </div>
    </div>
  );
}
