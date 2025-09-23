import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Header from "../components/partials/header";
import UserDrawer from "../components/users/UserDrawer";
import { getUsers } from "../features/db/users/api";
import UsersTable from "../components/users/UsersTable";
import UsersTableSkeleton from "../components/users/UsersTableSkeleton";
import { fmtDate, downloadCSV } from "../utils/userUtils";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [startInEdit, setStartInEdit] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((u) => {
      if (needle) {
        const text = `${u.displayName || ""} ${u.email || ""} ${
          u.phoneNumber || ""
        }`.toLowerCase();
        if (!text.includes(needle)) return false;
      }
      // ⬇️ default to "staff" now (no "customer")
      if (filterRole !== "all" && (u.role || "staff") !== filterRole)
        return false;
      if (filterStatus !== "all" && (u.status || "active") !== filterStatus)
        return false;
      return true;
    });
  }, [rows, q, filterRole, filterStatus]);

  return (
    <>
      <Header header={"Manage Users"} />
      <div className="max-w-screen-2xl mx-auto">
        <div className="mx-4 sm:mx-9 my-3">
          <div className="flex flex-wrap gap-4 justify-between bg-white text-gray-700 px-4 py-2">
            <div className="max-w-sm w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  className="block w-full px-4 py-2 outline-none pl-10 text-sm text-gray-700 border border-black rounded-full focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search users…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:items-center gap-2 sm:gap-3">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All roles</option>
                {/* ⬇️ admin / staff only */}
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
              <button
                onClick={() => downloadCSV(filtered)}
                className="px-5 py-2 border border-black text-xs rounded-md font-medium"
              >
                Download .csv
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  setStartInEdit(true);
                  setIsOpen(true);
                }}
                className="px-5 py-2 border border-black text-xs rounded-md font-semibold bg-black text-white"
              >
                + New User
              </button>
            </div>
          </div>

          <div className="my-3">
            {loading ? (
              <UsersTableSkeleton rows={6} />
            ) : (
              <UsersTable
                rows={filtered}
                fmtDate={fmtDate}
                onView={(u) => {
                  setSelected(u);
                  setStartInEdit(false);
                  setIsOpen(true);
                }}
                onEdit={(u) => {
                  setSelected(u);
                  setStartInEdit(true);
                  setIsOpen(true);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <UserDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={selected}
        startInEdit={startInEdit}
        onSaved={async () => {
          try {
            const data = await getUsers();
            setRows(Array.isArray(data) ? data : []);
          } catch {}
        }}
        onDeleted={(deletedId) => {
          setRows((r) => r.filter((x) => x.id !== deletedId));
          setSelected(null);
        }}
      />
    </>
  );
}
