import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";
import AuthLayout from "../../components/layout/AuthLayout";
import { register } from "../../services/authService";
import VerifyEmailPopup from "./VerifyEmailPopup";
import CustomToast from "../../components/toast/CustomToast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("warehouse_staff"); // 👈 default role
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(
    null,
  );

  // const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");

    if (verified === "1") {
      setToast({ message: "Email verified successfully!", type: "success" });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (verified === "0") {
      setToast({ message: "Invalid verification link!", type: "error" });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Confirm Password does not match!");
        return; // prevent form submission
      }
      await register(name, email, password, role);

      setShowVerifyPopup(true); // 👈 show email verification popup
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout variant="full" title="Warehouse Monitoring Register">
      {toast && (
        <CustomToast
          message={toast.message}
          type={toast.type as any}
          onClose={() => setToast(null)}
        />
      )}

      <div className="min-h-screen flex flex-col md:flex-row w-full">
        {/* LEFT SIDE - Desktop */}
        <div className="hidden md:flex w-1/2 bg-primary items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-center text-white px-10">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="mx-auto drop-shadow-lg rounded-md"
            />
            {/* <h2 className="text-4xl font-bold mb-3 uppercase"><span className="text-3xl lowercase">i</span>bodegero</h2> */}
            <p className="-mt-14 text-2xl opacity-90">Track stocks. Monitor movement. Optimize workflow.</p>
          </div>
        </div>

        {/* IMAGE ON MOBILE */}
        <div className="flex md:hidden w-full bg-primary items-center justify-center py-6">
          <div className="text-center text-white px-6">
            <img
              src="/350x350.png"
              alt="Warehouse"
              className="w-60 mb-4 mx-auto drop-shadow-lg rounded-md"
            />
            {/* <h2 className="text-2xl font-bold mb-1 uppercase"><span className="text-3xl lowercase">i</span>bodegero</h2> */}
            <p className="-mt-12 opacity-90">
              Track stocks. Monitor movement. Optimize workflow.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
          >
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              Create Account
            </h2>

            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}

              {/* Name */}
              <div className="relative">
                <FiUser
                  className="absolute top-3 left-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full pl-10 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <FiMail
                  className="absolute top-3 left-3 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none"
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
                  className="w-full pl-10 pr-10 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute top-3 right-3 cursor-pointer text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <FiLock
                  className="absolute top-3 left-3 text-gray-400"
                  size={20}
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full pl-10 pr-10 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <div
                  className="absolute top-3 right-3 cursor-pointer text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="relative">
                <FiUser
                  className="absolute top-3 left-3 text-gray-400"
                  size={20}
                />
                <select
                  className="w-full pl-10 py-3 border border-primary rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="warehouse_staff">Warehouse</option>
                  <option value="project_manager">Project Manager</option>
                </select>
              </div>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold shadow-md"
              >
                {loading ? "Registering..." : "Register"}
              </motion.button>

              {/* Login */}
              <p className="text-center text-sm mt-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      <VerifyEmailPopup
        isOpen={showVerifyPopup}
        onClose={() => setShowVerifyPopup(false)}
        onVerify={async (email) => {
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
