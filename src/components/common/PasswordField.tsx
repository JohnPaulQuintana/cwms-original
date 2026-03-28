import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative mb-3">
      <label className="text-sm text-neutralLight">{label}</label>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-primary rounded focus:ring-2 focus:ring-primary pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-11 transform -translate-y-1/2 text-neutralDark"
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}