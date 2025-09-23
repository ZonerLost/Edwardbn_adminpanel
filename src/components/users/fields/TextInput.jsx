import React from "react";

export default function TextInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-black/60 disabled:opacity-60"
      />
    </div>
  );
}
