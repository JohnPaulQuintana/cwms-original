import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  show: boolean;
  warehouseId: string;
  item: any;
  maxQuantity: number;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

export default function RequestQuantityModal({ show, item, maxQuantity, onClose, onSubmit }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuantity(1);
    setError("");
  }, [item]);

  const handleSubmit = () => {
    if (quantity < 1) return setError("Quantity must be at least 1");
    if (quantity > maxQuantity) return setError(`Cannot request more than ${maxQuantity}`);
    onSubmit(quantity);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-6 w-80 shadow-lg"
      >
        <h2 className="text-lg font-bold mb-4">Request {item.name}</h2>
        <p className="mb-2">Available quantity: {maxQuantity}</p>
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 border rounded-lg mb-2"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-lg">Submit</button>
        </div>
      </motion.div>
    </div>
  );
}
