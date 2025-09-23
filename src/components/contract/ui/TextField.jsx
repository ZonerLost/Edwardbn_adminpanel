import React from "react";

export default function TextField({ label, placeholder, error, ...props }) {
  const invalid = Boolean(error);
  return (
    <div>
      <label className="block text-sm mb-1">
        {label} {invalid && <span className="text-red-600">*</span>}
      </label>
      <input
        {...props}
        placeholder={placeholder}
        className={`w-full border rounded px-3 py-2 outline-none ${
          invalid ? "border-red-500 focus:ring-1 ring-red-500" : "border-gray-300 focus:ring-1 ring-gray-300"
        }`}
      />
      {invalid && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
