import React from "react";

export default function FaqListMobile({ rows = [], fmtDate, onView, onEdit, onDelete, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
            <div className="h-3 w-full bg-gray-100 rounded mt-3" />
            <div className="h-3 w-3/4 bg-gray-100 rounded mt-2" />
            <div className="flex gap-2 mt-3">
              <div className="h-7 w-16 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-200 rounded" />
              <div className="h-7 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((f, idx) => (
        <div key={f.id || idx} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{f.title || "-"}</div>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                String(f.status || "").toLowerCase() === "published"
                  ? "text-green-700 bg-green-500/10"
                  : String(f.status || "").toLowerCase() === "draft"
                  ? "text-yellow-700 bg-yellow-500/10"
                  : "text-gray-600 bg-gray-500/10"
              }`}
            >
              {f.status || "-"}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{fmtDate ? fmtDate(f.createdAt) : "-"}</div>

          <p className="text-sm text-gray-700 mt-2 line-clamp-3">{f.answer || "-"}</p>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onView?.(f)}
              className="px-3 py-1 rounded bg-black text-white text-xs"
            >
              View
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(f)}
              className="px-3 py-1 rounded border text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(f)}
              className="px-3 py-1 rounded border text-xs text-red-600 border-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
