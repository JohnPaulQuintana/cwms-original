import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // in ms
  onClose?: () => void;
}

export default function CustomToast({
  message,
  type = "info",
  duration = 4000,
  onClose,
}: CustomToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 right-5 z-50 px-5 py-3 text-white rounded-xl shadow-lg ${bgColor}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}