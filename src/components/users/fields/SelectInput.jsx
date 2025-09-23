import React from "react";

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options = [],
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border rounded px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-black/60 disabled:opacity-60"
      >
        <option value="" disabled>
          {placeholder || "Select…"}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
