import { motion } from "framer-motion";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FiBox,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTruck
} from "react-icons/fi";
import DashboardCard from "../../components/common/DashboardCard";

//hooks
import { useAuth } from "../../hooks/useAuth";
const API_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const { user, token } = useAuth();
  // console.log(user)
  const [overview, setOverview] = useState({
    projects: 0,
    warehouses: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    shipments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchOverview = async () => {
      try {
        const res = await axios.get(`${API_URL}/overviewWarehouse/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setOverview(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [user?.id]);

  return (
    <>
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-md shadow-md mb-2"
      >
        <h2 className="text-xl font-bold text-primary">Welcome, {user?.name}!</h2>
        <p className="text-neutralDark">
          Here you can manage users, inventory, and monitor warehouse operations.
        </p>
      </motion.div>

      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 bg-white p-6 rounded-md"
      >
        <h2 className="text-2xl font-bold text-primary">Dashboard Overview</h2>

        {/* Grid of cards */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-72">
                    <motion.div
                      className="w-24 h-24 border-[6px] border-primary/30 border-t-primary rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 0.8,
                      }}
                    />
                    <h2 className="text-2xl font-bold text-primary">
                      Loading Overview...
                    </h2>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
                    <DashboardCard
                      title="Projects"
                      value={overview.projects}
                      icon={<FiBox size={24} />}
                      color="bg-secondary"
                    />
        
                    <DashboardCard
                      title="Warehouses"
                      value={overview.warehouses}
                      icon={<FiBox size={24} />}
                      color="bg-primary"
                    />
        
                    <DashboardCard
                      title="Approved"
                      value={overview.approved}
                      icon={<FiCheckCircle size={24} />}
                      color="bg-green-500"
                    />
        
                    <DashboardCard
                      title="Shipments"
                      value={overview.shipments}
                      icon={<FiTruck size={24} />}
                      color="bg-primaryLight"
                    />
        
                    <DashboardCard
                      title="Rejected"
                      value={overview.rejected}
                      icon={<FiXCircle size={24} />}
                      color="bg-error"
                    />
        
                    <DashboardCard
                      title="Pending"
                      value={overview.pending}
                      icon={<FiClock size={24} />}
                      color="bg-yellow-500"
                    />
                  </div>
                )}
      </motion.div>
    </>
  );
}
