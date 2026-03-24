import type { FC } from "react";

interface Props {
  show: boolean;
  itemName: string;
  quantity: number;
  maxQuantity: number;
  onChange: (value: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const QuantityModal: FC<Props> = ({ show, itemName, quantity, maxQuantity, onChange, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-80 p-6">
        <h2 className="text-lg font-bold mb-4">Set Quantity for {itemName}</h2>
        <input
          type="number"
          min={1}
          max={maxQuantity}
          value={quantity}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantityModal;
