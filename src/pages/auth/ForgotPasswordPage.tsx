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
    <AuthLayout variant="full" title="Forgot Password">
      <div className="min-h-screen flex flex-col md:flex-row w-full">
        {/* LEFT SIDE - Desktop */}
        <div className="hidden md:flex w-1/2 bg-primary items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-center text-white px-10">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="w-60 mx-auto mb-6 drop-shadow-lg"
            />
            <h2 className="text-4xl font-bold mb-3"><span className="text-3xl lowercase">i</span>bodegero</h2>
            <p className="opacity-90">Track stocks. Monitor movement. Optimize workflow.</p>
          </div>
        </div>

        {/* MOBILE IMAGE */}
        <div className="flex md:hidden w-full bg-primary items-center justify-center py-6">
          <div className="text-center text-white px-6">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="w-40 mx-auto mb-4 drop-shadow-lg"
            />
            <h2 className="text-2xl font-bold mb-1"><span className="text-3xl lowercase">i</span>bodegero</h2>
            <p className="text-sm opacity-90">Track stocks. Monitor movement. Optimize workflow.</p>
          </div>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
          >
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
                  className="w-full pl-10 pr-3 py-3 border border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLight transition shadow-sm"
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
        </div>
      </div>
    </AuthLayout>
  );
}