import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import {
  type Project,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projectService";
import { type User, fetchManager } from "../../services/userService";
import ProjectModal from "../../components/modals/ProjectModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
import { showToast } from "../../utils/toast";

export default function ProjectPage() {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [processing, setProcessing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  // 🔁 Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load projects and managers
  const loadProjects = async () => {
    if (!token) return setError("No token found. Please log in again.");
    setLoading(true);
    try {
      const resProjects = await fetchProjects(token, debouncedSearch, page);
      const resManagers = await fetchManager(token);

      // Extract paginated object
      const paginatedData = resProjects.data;
      // console.log(paginatedData)
      // Set projects array
      setProjects(paginatedData.data || []);

      // Set total pages
      setTotalPages(paginatedData.last_page || 1);
      setManagers(resManagers.data?.data || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProjects();
  }, [token, debouncedSearch, page]);

  // Pagination handlers
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages));

  // Add/Edit/Delete handlers
  const handleAdd = () => {
    setModalMode("add");
    setSelectedProject(null);
    setShowModal(true);
  };

  const handleEdit = (project: Project) => {
    setModalMode("edit");
    setSelectedProject(project);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setProjectToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(token!, projectToDelete);
      showToast("Project deleted successfully", "success");
      await loadProjects();
    } catch {
      showToast("Failed to delete project", "error");
    } finally {
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      setProcessing(true);
      if (modalMode === "add") {
        await createProject(token!, formData);
        showToast("Project added successfully", "success");
      } else if (modalMode === "edit" && selectedProject) {
        await updateProject(token!, selectedProject.id, formData);
        showToast("Project updated successfully", "success");
      }
      setShowModal(false);
      await loadProjects();
    } catch (err: any) {
      showToast(err.message || "Failed to save project", "error");
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
        >
          Loading projects...
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
        <h1 className="text-2xl font-bold text-primary">Manage Projects</h1>
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
            <FiPlus size={18} /> Project
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
              <th className="p-3 text-sm font-medium hidden sm:table-cell">
                Location
              </th>
              <th className="p-3 text-sm font-medium hidden md:table-cell">
                Manager
              </th>
              <th className="p-3 text-sm font-medium hidden lg:table-cell">
                Start Date
              </th>
              <th className="p-3 text-sm font-medium hidden lg:table-cell">
                End Date
              </th>
              <th className="p-3 text-sm font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects && projects.length > 0 ? (
              projects.map((project, i) => (
                <tr key={project.id} className="border-t hover:bg-neutralLight">
                  <td className="p-3 text-sm">{(page - 1) * 10 + i + 1}</td>
                  <td className="p-3 text-sm font-medium">{project.name}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">
                    {project.location}
                  </td>
                  <td className="p-3 text-sm hidden md:table-cell">
                    {project.manager?.name}
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {project.start_date
                      ? new Date(project.start_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    {project.end_date
                      ? new Date(project.end_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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
                  colSpan={7}
                  className="text-center text-gray-500 py-4 text-sm"
                >
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300 hover:bg-primary-dark"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page === totalPages}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300 hover:bg-primary-dark"
        >
          Next
        </button>
      </div>

      {/* Modals */}
      <ProjectModal
        show={showModal}
        mode={modalMode}
        managers={managers}
        initialData={
          selectedProject
            ? {
                name: selectedProject.name,
                location: selectedProject.location,
                manager_id: selectedProject.manager_id,
                start_date: selectedProject.start_date || "",
                end_date: selectedProject.end_date || "",
              }
            : undefined
        }
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        processing={processing}
      />

      <ConfirmModal
        show={showDeleteModal}
        message="Are you sure you want to delete this project?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
