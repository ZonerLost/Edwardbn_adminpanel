import React from "react";

export default function Progress({ label, value }) {
  return (
    <div className="text-xs">
      <div className="flex justify-between mb-1">
        <span className="text-gray-600">{label} upload</span>
        <span>{Math.max(0, Math.min(100, Number(value) || 0))}%</span>
      </div>
      <div className="h-1 bg-gray-200 rounded">
        <div
          className="h-1 bg-blue-500 rounded transition-[width] duration-200"
          style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }}
        />
      </div>
    </div>
  );
}
