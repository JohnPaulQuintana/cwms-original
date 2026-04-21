import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  type User,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/userService";

// Modal
import UserModal from "../../components/modals/UserModal";

export default function UsersPage() {
  const { token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);

  //confirm state
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load users
  const loadUsers = async () => {
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchUsers(token, page, debouncedSearch);
      setUsers(res.data.data);
      setTotalPages(res.data.last_page);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadUsers();
  }, [token, page, debouncedSearch]);

  // Pagination
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  // Toast helper
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Modal handlers
  const handleAdd = () => {
    setModalMode("add");
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setConfirmMessage("Are you sure you want to delete this user?");
    setConfirmAction(() => async () => {
      try {
        await deleteUser(token!, id);
        showToast("User deleted successfully", "success");
        await loadUsers();
      } catch {
        showToast("Failed to delete user", "error");
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setProcessing(true);
      if (modalMode === "add") {
        await createUser(token!, formData);
        showToast("User created successfully", "success");
      } else if (modalMode === "edit" && selectedUser) {
        await updateUser(token!, selectedUser.id, formData);
        showToast("User updated successfully", "success");
      }
      setShowModal(false);
      await loadUsers();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to save user", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Loading State
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
          Loading users...
        </motion.p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // Main Content
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold text-primary">Manage Users</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 p-2 border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FiPlus size={18} /> User
          </button>
        </div>
      </div>

      {/* ================= WRAPPER ================= */}
      <div className="border rounded-lg">
        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="md:hidden space-y-4 p-3">
          {users.length > 0 ? (
            users.map((user, i) => (
              <div
                key={user.id}
                className="border rounded-xl p-4 shadow-sm bg-white"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500">
                      #{(page - 1) * 10 + i + 1}
                    </p>
                    <h2 className="font-semibold text-lg">{user.name}</h2>
                  </div>

                  {/* Status */}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      user.is_active
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Details */}
                <div className="mt-3 text-sm space-y-1">
                  <p>
                    <span className="font-medium">Email:</span> {user.email}
                  </p>

                  <p>
                    <span className="font-medium">Role:</span>{" "}
                    {user.role.replace("_", " ")}
                  </p>

                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex-1 text-blue-600 border border-blue-600 rounded-lg py-1"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(user.id)}
                    className="flex-1 text-red-600 border border-red-600 rounded-lg py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 text-sm py-4">
              No users found.
            </p>
          )}
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-neutralLight text-left">
              <tr>
                <th className="p-3 text-sm font-medium">#</th>
                <th className="p-3 text-sm font-medium">Name</th>
                <th className="p-3 text-sm font-medium">Email</th>
                <th className="p-3 text-sm font-medium">Role</th>
                <th className="p-3 text-sm font-medium">Status</th>
                <th className="p-3 text-sm font-medium">Created At</th>
                <th className="p-3 text-sm font-medium text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} className="border-t hover:bg-neutralLight">
                  <td className="p-3 text-sm">{(page - 1) * 10 + i + 1}</td>

                  <td className="p-3 text-sm font-medium">{user.name}</td>

                  <td className="p-3 text-sm">{user.email}</td>

                  <td className="p-3 text-sm capitalize">
                    {user.role.replace("_", " ")}
                  </td>

                  <td className="p-3 text-sm">
                    <span
                      className={
                        user.is_active
                          ? "text-white bg-green-600 px-2 py-1 rounded-xl font-semibold"
                          : "text-white bg-red-600 px-2 py-1 rounded-xl font-semibold"
                      }
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  <td className="p-3 text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FiEdit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <div className="text-sm text-gray-600">
          Showing {users.length} users on page {page} of {totalPages}
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

      {/* User Modal */}
      <UserModal
        show={showModal}
        mode={modalMode}
        initialData={
          selectedUser
            ? {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
              }
            : undefined
        }
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        processing={processing}
      />

      {/* Toast Popup */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow p-6 w-80">
            <p className="text-gray-800 mb-4">{confirmMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction && confirmAction()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
