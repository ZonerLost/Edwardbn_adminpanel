import React from "react";

export default function CheckboxList({
  items = [],
  values = [],
  onToggle,
  disabled,
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-2 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {items.map((p) => (
        <label key={p} className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.includes(p)}
            onChange={() => onToggle(p)}
            disabled={disabled}
          />
          <span>{p}</span>
        </label>
      ))}
    </div>
  );
}
