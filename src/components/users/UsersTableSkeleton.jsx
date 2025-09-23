import React from "react";

/**
 * UsersTableSkeleton
 * Props:
 * - rows: number of placeholder rows (default 6)
 */
export default function UsersTableSkeleton({ rows = 6 }) {
  return (
    <div className="relative overflow-x-auto drop-shadow-xl bg-white sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase border-b-2 border-quinary bg-white">
          <tr>
            <th className="px-6 py-3">Full name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Phone</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Joined</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-quinary">
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <div className="h-6 w-14 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
