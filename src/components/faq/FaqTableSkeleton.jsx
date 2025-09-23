import React from "react";

export default function FaqTableSkeleton({ rows = 5 }) {
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
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-secondary">
              <td className="px-6 py-4">
                <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 w-72 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
