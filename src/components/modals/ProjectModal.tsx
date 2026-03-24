import { useState, useEffect } from "react";
import { showToast } from "../../utils/toast";
import { type User } from "../../services/userService";

interface ProjectModalProps {
  show: boolean;
  mode: "add" | "edit";
  initialData?: {
    name: string;
    location: string;
    manager_id: number;
    start_date: string;
    end_date: string;
  };
  managers: User[]; // <-- pass all managers here
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    location: string;
    manager_id: number;
    start_date: string;
    end_date: string;
  }) => Promise<void> | void;
  processing?: boolean;
}

export default function ProjectModal({
  show,
  mode,
  initialData,
  managers,
  onClose,
  onSubmit,
  processing = false,
}: ProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    manager_id: managers[0]?.id || 1,
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name,
        location: initialData.location,
        manager_id: initialData.manager_id,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
      });
    }
  }, [mode, initialData]);

  const handleChange = (key: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location) {
      showToast("Name and location are required.", "error");
      return;
    }
    await onSubmit(formData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">
          {mode === "add" ? "Add New Project" : "Edit Project"}
        </h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          <select
            value={formData.manager_id}
            onChange={(e) =>
              handleChange("manager_id", Number(e.target.value))
            }
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
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
              ? "Add Project"
              : "Update Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
