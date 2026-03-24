import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail } from "react-icons/fi";
import { motion } from "framer-motion";
import AuthLayout from "../../components/layout/AuthLayout";
import { forgotPassword } from "../../services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = await forgotPassword(email);
    setMessage(msg);
  };

  return (
    <AuthLayout title="Forgot Password">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-neutralLight"
      >
        {/* Image */}
        <div className="flex flex-col items-center justify-center mb-4 bg-primary rounded-md p-4">
          <img
            src="/warehouse.svg"
            alt="Warehouse"
            className="w-48 h-48 object-contain rounded-lg"
          />
          <h3 className="font-bold text-neutralLight tracking-wider mt-2 uppercase text-center">
            Warehouse Monitoring Login
          </h3>
        </div>
        
        <h2 className="text-3xl font-bold text-primary mb-6 text-center">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-green-600 text-center"
            >
              {message}
            </motion.p>
          )}

          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-neutralDark" size={20} />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 pr-3 py-3 border border-neutralLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLight transition shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primaryLight transition shadow-md"
          >
            Send Reset Link
          </motion.button>

          <div className="text-center text-sm mt-2">
            <Link
              to="/login"
              className="text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </motion.div>
    </AuthLayout>
  );
}
