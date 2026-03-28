import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import AuthLayout from "../../components/layout/AuthLayout";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import VerifyEmailPopup from "./VerifyEmailPopup";
// import { toast } from "react-toastify";
import CustomToast from "../../components/toast/CustomToast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(
    null,
  );

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");

    if (verified === "1") {
      setToast({ message: "Email verified successfully!", type: "success" });
      // Remove query so toast doesn’t show again
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (verified === "0") {
      setToast({ message: "Invalid verification link!", type: "error" });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      loginUser(res.user, res.token, res.admin_approval);

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
    <AuthLayout variant="full" title="Warehouse Monitoring Login">
      {toast && (
        <CustomToast
          message={toast.message}
          type={toast.type as any}
          onClose={() => setToast(null)}
        />
      )}
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* LEFT SIDE - Desktop */}
        <div className="hidden md:flex w-1/2 bg-primary items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-center text-white px-10">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="w-60 mx-auto mb-6 rounded-md"
            />
            <h2 className="text-4xl font-bold mb-3">Warehouse Monitoring</h2>
            <p className="opacity-90">Track. Manage. Optimize operations.</p>
          </div>
        </div>

        {/* IMAGE ON MOBILE */}
        <div className="flex md:hidden w-full bg-primary items-center justify-center py-6">
          <div className="text-center text-white px-6">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="w-40 mx-auto mb-4 rounded-md"
            />
            <h2 className="text-2xl font-bold mb-1">Warehouse Monitoring</h2>
            <p className="opacity-90">Track. Manage. Optimize operations.</p>
          </div>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              Welcome Back!
            </h2>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}

              {/* Email */}
              <div className="relative">
                <FiMail
                  className="absolute top-3 left-3 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <FiLock
                  className="absolute top-3 left-3 text-gray-400"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute top-3 right-3 cursor-pointer text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>

              <div className="text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <p className="text-center text-sm mt-6">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

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
            },
          );
          const data = await res.json();
          if (!data.success)
            throw new Error(
              data.message || "Failed to send verification email",
            );
          return data.message || "Verification email sent!";
        }}
      />
    </AuthLayout>
  );
}
