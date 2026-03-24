import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string; // optional for custom color background
}

export default function DashboardCard({
  title,
  value,
  icon,
  color,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition"
    >
      <div>
        <h3 className="text-sm font-medium text-neutralDark uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-2xl font-bold text-primary mt-1">{value}</p>
      </div>
      <div
        className={`p-3 rounded-xl text-white flex items-center justify-center shadow-md ${
          color || "bg-primary"
        }`}
      >
        {icon}
      </div>
    </motion.div>
  );
}
