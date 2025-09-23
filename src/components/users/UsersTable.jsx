import React from "react";

/**
 * UsersTable
 * Props:
 * - rows: array of users
 * - fmtDate: fn(dateLike) -> string (from utils/userUtils)
 * - onView: (user) => void
 * - onEdit: (user) => void
 */
export default function UsersTable({ rows = [], fmtDate, onView, onEdit }) {
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
          {rows.length === 0 ? (
            <tr>
              <td className="px-6 py-6 text-gray-500" colSpan={7}>
                No users found.
              </td>
            </tr>
          ) : (
            rows.map((u, idx) => {
              const role = u.role || "staff";           // default role
              const status = u.status || "active";      // default status
              const isActive = status === "active";
              return (
                <tr key={u.id || u.uid || idx} className="border-b border-quinary hover:bg-primary/10">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <img
                        src={u.photoURL || "https://i.pravatar.cc/80"}
                        alt={u.displayName || "avatar"}
                        className="w-8 h-8 rounded-full object-cover"
                        loading="lazy"
                      />
                      <span>{u.displayName || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{u.email || "-"}</td>
                  <td className="px-6 py-4">{u.phoneNumber || "-"}</td>
                  <td className="px-6 py-4">{role}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium px-3 py-0.5 rounded-md ${
                        isActive ? "text-green-600 bg-green-500/10" : "text-gray-600 bg-gray-500/10"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{fmtDate ? fmtDate(u.createdAt) : "-"}</td>
                  <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onView?.(u)}
                      className="font-medium text-black bg-primary/20 px-3 py-0.5 rounded-md"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit?.(u)}
                      className="font-medium text-green-600 bg-green-500/10 px-3 py-0.5 rounded-md"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
