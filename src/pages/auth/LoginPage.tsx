import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import AuthLayout from "../../components/layout/AuthLayout";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import VerifyEmailPopup from "./VerifyEmailPopup";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      loginUser(res.user, res.token);

      switch (res.user.role) {
        case "admin":
          navigate("/dashboard/admin");
          break;
        case "warehouse_staff":
          navigate("/dashboard/warehouse");
          break;
        case "project_manager":
          navigate("/dashboard/manager");
          break;
        default:
          navigate("/login");
      }
    } catch (err: any) {
      // Show popup if email verification is required
      if (err.message.includes("verify your email")) {
        setShowVerifyPopup(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Warehouse Monitoring Login">
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
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-error text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Email Input */}
          <div className="relative">
            <FiMail
              className="absolute top-3 left-3 text-neutralDark"
              size={20}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 pr-3 py-3 border border-neutralLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLight transition shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="relative">
            <FiLock
              className="absolute top-3 left-3 text-neutralDark"
              size={20}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-10 py-3 border border-neutralLight rounded-xl focus:outline-none focus:ring-2 focus:ring-primaryLight transition shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="absolute top-3 right-3 cursor-pointer text-neutralDark"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primaryLight transition shadow-md"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <div className="text-center text-sm mt-2">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </motion.div>

      <VerifyEmailPopup
        isOpen={showVerifyPopup}
        onClose={() => setShowVerifyPopup(false)}
        onVerify={async (email) => {
          // API call to resend verification email
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/email/resend`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }
          );
          const data = await res.json();
          if (!data.success)
            throw new Error(
              data.message || "Failed to send verification email"
            );
          return data.message || "Verification email sent!";
        }}
      />
    </AuthLayout>
  );
}
