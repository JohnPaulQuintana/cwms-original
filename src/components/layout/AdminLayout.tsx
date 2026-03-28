import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useUpdatePassword } from "../../hooks/useUpdatePassword";
import { navConfig } from "../../config/navConfig";
import { Outlet } from "react-router-dom";
import { PasswordField } from "../common/PasswordField";

export default function AdminLayout() {
  const { user, logoutUser, adminApproval, updateProfileInfo } = useAuth(); // add updateUser
  const { updatePassword } = useUpdatePassword();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileSidebarOpen, setProfileSidebarOpen] = useState(false); // new
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  console.log(dropdownOpen);
  console.log(notifOpen);

  const [profileForm, setProfileForm] = useState<{
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleProfileSave = async () => {
    const success = await updateProfileInfo({
      name: profileForm.name,
      email: profileForm.email,
    });

    if (success) {
      setProfileSidebarOpen(false); // only close if update succeeded
    }
    // otherwise sidebar stays open
  };

  const handlePasswordChangeSave = async () => {
    const success = await updatePassword({
      currentPassword: profileForm.currentPassword,
      newPassword: profileForm.newPassword,
      confirmPassword: profileForm.confirmPassword,
    });

    if (success) {
      // ✅ Reset password fields after successful update
      setProfileForm({
        ...profileForm,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // 🔒 Close sidebar after successful password change
      setProfileSidebarOpen(false);
    }
    // ❌ If update failed, do nothing — sidebar stays open
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      )
        setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = user?.role || "admin";
  const links = navConfig[role] || [];

  return (
    <div className="flex h-screen bg-neutralLight">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-primary text-white p-6 space-y-6 shadow-lg">
        <div className="flex flex-col items-center border p-2 rounded-md border-primaryLight">
          <img
            src="/350x350.png"
            alt="Warehouse"
            className="w-20 mx-auto rounded-md"
          />
          {/* <h2 className="font-bold text-F3F4F6">CWMS</h2> */}
          <h2 className="text-2xl font-bold uppercase">Dashboard</h2>
        </div>
        <nav className="flex-1 flex flex-col space-y-3">
          {links.map(({ label, icon: Icon, path }) => {
            const isDisabled =
              adminApproval && label.toLowerCase() !== "dashboard";
            if (isDisabled)
              return (
                <div
                  key={label}
                  className="flex items-center space-x-2 p-2 rounded opacity-50 cursor-not-allowed"
                >
                  <Icon />
                  <span>{label}</span>
                </div>
              );
            return (
              <Link
                key={label}
                to={path}
                className={`flex items-center space-x-2 p-2 rounded transition ${location.pathname === path ? "bg-primaryLight text-white font-semibold" : ""} hover:bg-primaryLight`}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile + Logout */}
        <div className="mt-auto flex flex-col space-y-3">
          <button
            onClick={() => setProfileSidebarOpen(true)}
            className="flex items-center space-x-2 p-2 rounded hover:bg-primaryLight transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-semibold">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>
            <span>{user?.name || "Profile"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 rounded bg-red-600 hover:bg-red-700 transition"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <motion.div
        animate={{ x: sidebarOpen ? 0 : -250 }}
        className="fixed z-40 inset-y-0 left-0 w-64 bg-primary text-white p-6 flex flex-col space-y-6 shadow-lg md:hidden"
      >
        <div className="mb-6 relative">
          <div className="flex flex-col items-center border p-2 rounded-md border-primaryLight">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="w-20 mx-auto rounded-md"
            />
            {/* <h2 className="font-bold text-F3F4F6">CWMS</h2> */}
            <h2 className="text-2xl font-bold uppercase">Dashboard</h2>
          </div>
          <button
            className="p-2 px-4 text-primary font-bold rounded hover:bg-error transition absolute -top-6 -right-6 bg-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 flex flex-col space-y-3">
          {links.map(({ label, icon: Icon, path }) => {
            const isDisabled =
              adminApproval && label.toLowerCase() !== "dashboard";
            if (isDisabled)
              return (
                <div
                  key={label}
                  className="flex items-center space-x-2 p-2 rounded opacity-50 cursor-not-allowed"
                >
                  <Icon />
                  <span>{label}</span>
                </div>
              );
            return (
              <Link
                key={label}
                to={path}
                className={`flex items-center space-x-2 p-2 rounded transition ${location.pathname === path ? "bg-primaryLight text-white font-semibold" : ""} hover:bg-primaryLight`}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile + Logout */}
        <div className="mt-auto flex flex-col space-y-3">
          <button
            onClick={() => setProfileSidebarOpen(true)}
            className="flex items-center space-x-2 p-2 rounded hover:bg-primaryLight transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span>{user?.name || "Profile"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-2 rounded bg-red-700 hover:bg-red-800 transition"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Sidebar */}
      <AnimatePresence>
        {profileSidebarOpen && (
          <motion.div
            key="profile-sidebar"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-primary shadow-lg z-50 p-6 flex flex-col overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white px-3 py-1 rounded">
                Edit Profile
              </h2>
              <button
                onClick={() => setProfileSidebarOpen(false)}
                className="p-2 rounded bg-neutralLight hover:bg-neutralLight transition"
              >
                <FiX color="red" size={20} />
              </button>
            </div>

            <div className="flex flex-col space-y-4">
              {/* Name & Email */}
              <div>
                <label className="text-sm text-neutralLight">Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm text-neutralLight">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full p-2 border border-primary rounded focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                onClick={handleProfileSave}
                className="bg-primaryLight text-white py-2 rounded hover:bg-primaryLight transition mt-4"
              >
                Save Changes
              </button>

              {/* Password Update */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-md font-semibold text-neutralLight mb-2">
                  Update Password
                </h3>
                <PasswordField
                  label="Current Password"
                  value={profileForm.currentPassword || ""}
                  onChange={(val) =>
                    setProfileForm({ ...profileForm, currentPassword: val })
                  }
                />
                <PasswordField
                  label="New Password"
                  value={profileForm.newPassword || ""}
                  onChange={(val) =>
                    setProfileForm({ ...profileForm, newPassword: val })
                  }
                />
                <PasswordField
                  label="Confirm Password"
                  value={profileForm.confirmPassword || ""}
                  onChange={(val) =>
                    setProfileForm({ ...profileForm, confirmPassword: val })
                  }
                />
              </div>
              <button
                onClick={handlePasswordChangeSave}
                className="bg-primaryLight text-white py-2 rounded hover:bg-primaryLight transition mt-4"
              >
                Update Password
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white shadow-md relative">
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded bg-neutralLight hover:bg-neutralDark transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FiMenu size={20} className="text-primary" />
            </button>
            <h1 className="text-2xl font-bold text-primary">CWMS Dashboard</h1>
          </div>
        </header>

        {adminApproval && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-center font-medium">
            Your account is not yet assigned to an organization. You can only
            access the Dashboard.
          </div>
        )}

        <main className="p-4 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
