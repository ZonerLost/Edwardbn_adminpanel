import React from "react";

export default function FaqTable({
  rows = [],
  fmtDate,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="relative overflow-x-auto drop-shadow-xl bg-white sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase border-b-2 border-secondary bg-white">
          <tr>
            <th className="px-6 py-3">Title</th>
            <th className="px-6 py-3">Answer</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Created</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded mr-8 shadow text-gray-500">
                No FAQs found.
              </div>
            </div>
          ) : (
            rows.map((f, idx) => (
              <tr
                key={f.id || idx}
                className="border-b border-secondary hover:bg-primary/10"
              >
                <td className="px-6 py-4">{f.title || "-"}</td>
                <td className="px-6 py-4 max-w-xl truncate">
                  {f.answer || "-"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`font-medium px-3 py-0.5 rounded-md ${
                      String(f.status || "").toLowerCase() === "published"
                        ? "text-green-600 bg-green-500/10"
                        : String(f.status || "").toLowerCase() === "draft"
                        ? "text-yellow-700 bg-yellow-500/10"
                        : "text-gray-600 bg-gray-500/10"
                    }`}
                  >
                    {f.status || "-"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {fmtDate ? fmtDate(f.createdAt) : "-"}
                </td>
                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onView?.(f)}
                    className="font-medium text-black bg-primary/20 px-3 py-0.5 rounded-md"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit?.(f)}
                    className="font-medium text-green-600 bg-green-500/10 px-3 py-0.5 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete?.(f)}
                    className="font-medium text-red-600 bg-red-500/10 px-3 py-0.5 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
