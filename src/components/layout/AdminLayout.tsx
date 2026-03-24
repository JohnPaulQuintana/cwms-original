import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { navConfig } from "../../config/navConfig";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Dummy notifications — replace with API later
  const notifications = [
    { id: 1, message: "New user registered", time: "2 min ago" },
    { id: 2, message: "Warehouse item updated", time: "10 min ago" },
    { id: 3, message: "Project approved by Admin", time: "1 hour ago" },
    { id: 4, message: "Project approved by Admin", time: "1 hour ago" },
    { id: 5, message: "Project approved by Admin", time: "1 hour ago" },
  ];

  console.log(notifOpen)
  console.log(notifications)
  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
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
        <h2 className="text-2xl font-bold">Dashboard Panel</h2>
        <nav className="flex flex-col space-y-3">
          {links.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              className={`flex items-center space-x-2 p-2 rounded hover:bg-primaryLight transition
                ${
                  location.pathname === path
                    ? "bg-primaryLight text-white font-semibold"
                    : "hover:bg-primaryLight"
                }`}
            >
              <Icon /> <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Sidebar (Mobile) */}
      <motion.div
        animate={{ x: sidebarOpen ? 0 : -250 }}
        className="fixed z-40 inset-y-0 left-0 w-64 bg-primary text-white p-6 flex flex-col space-y-6 shadow-lg md:hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Dashboard Panel</h2>
          <button
            className="p-2 rounded hover:bg-primaryLight transition"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav className="flex flex-col space-y-3">
          {links.map(({ label, icon: Icon, path }) => (
            <Link
              key={label}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-2 p-2 rounded hover:bg-primaryLight transition
                ${
                  location.pathname === path
                    ? "bg-primaryLight text-white font-semibold"
                    : "hover:bg-primaryLight"
                }`}>
              <Icon /> <span>{label}</span>
            </Link>
          ))}
        </nav>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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

          <div className="flex items-center space-x-6">
            {/* 🔔 Notification */}
            {/* <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full hover:bg-neutralLight transition"
              >
                <FiBell size={22} className="text-primary" />
                {notifications.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="absolute top-1 right-1 bg-error text-white text-xs px-1.5 py-0.5 rounded-full"
                  >
                    {notifications.length}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    key="notif-popup"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-neutralLight rounded-xl shadow-lg z-50 origin-top-right"
                  >
                    <div className="p-3 border-b border-neutralLight flex justify-between items-center">
                      <h3 className="font-semibold text-primary">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-sm text-neutralDark hover:text-error transition"
                      >
                        Close
                      </button>
                    </div>

                    <motion.ul
                      className="max-h-64 overflow-y-auto divide-y divide-neutralLight"
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: {},
                        show: {
                          transition: {
                            staggerChildren: 0.08,
                          },
                        },
                      }}
                    >
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <motion.li
                            key={notif.id}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              show: { opacity: 1, y: 0 },
                            }}
                            className="p-3 hover:bg-neutralLight cursor-pointer"
                          >
                            <p className="text-sm text-neutralDark">
                              {notif.message}
                            </p>
                            <span className="text-xs text-gray-500">
                              {notif.time}
                            </span>
                          </motion.li>
                        ))
                      ) : (
                        <li className="p-3 text-sm text-gray-500 text-center">
                          No new notifications
                        </li>
                      )}
                    </motion.ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div> */}

            {/* 👤 Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-semibold hover:bg-primaryLight transition"
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    key="profile-dropdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-60 bg-white border border-neutralLight rounded-xl shadow-lg p-4 z-50"
                  >
                    <p className="text-lg font-semibold text-primary">
                      {user?.name}
                    </p>
                    <p className="text-sm text-neutralDark mb-3">
                      {user?.email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 w-full bg-error text-white py-2 rounded-lg hover:bg-red-600 transition"
                    >
                      <FiLogOut /> <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 flex-1 overflow-auto"><Outlet /> {/* renders the nested page */}</main>
      </div>
    </div>
  );
}
