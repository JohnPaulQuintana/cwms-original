import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface VerifyEmailPopupProps {
  isOpen: boolean;                 // Show/hide popup
  onClose: () => void;             // Close function
  onVerify: (email: string) => Promise<string>; // API call function
}

export default function VerifyEmailPopup({ isOpen, onClose, onVerify }: VerifyEmailPopupProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const msg = await onVerify(email);
      setMessage(msg);
    } catch (err: any) {
      setMessage(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-neutralLight relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-neutralDark font-bold text-xl"
              onClick={onClose}
            >
              ×
            </button>

            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              Verify Email
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
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primaryLight transition shadow-md"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
