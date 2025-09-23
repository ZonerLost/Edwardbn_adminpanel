import React from "react";

export default function Uploader({ label, previewUrl, onPick, onClear, maxMB = 5 }) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-input`;
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {previewUrl ? (
          <img src={previewUrl} alt={label} className="w-16 h-16 rounded object-cover border" />
        ) : (
          <div className="w-16 h-16 rounded border flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}
        <div className="flex items-center gap-2">
          <input id={inputId} type="file" accept="image/*" className="hidden" onChange={onPick} />
          <label
            htmlFor={inputId}
            className="inline-flex items-center px-3 py-1.5 rounded border text-sm cursor-pointer"
          >
            {previewUrl ? "Replace image" : "Upload image"}
          </label>
          {previewUrl && (
            <button type="button" onClick={onClear} className="px-3 py-1.5 rounded border text-sm">
              Remove
            </button>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">JPEG/PNG, up to {maxMB} MB.</div>
    </div>
  );
}
