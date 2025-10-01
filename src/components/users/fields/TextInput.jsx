import React from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function TextInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}) {
  const isPassword = type === "password";
  const [reveal, setReveal] = React.useState(false);

  const inputType = isPassword && reveal ? "text" : type;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-black/60 disabled:opacity-60 ${
            isPassword ? "pr-10" : ""
          }`}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={reveal ? "Hide password" : "Show password"}
            onClick={() => setReveal((s) => !s)}
            disabled={disabled}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-60"
          >
            {reveal ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
