import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Header from "../components/partials/header";
import ContractDrawer from "../components/contract/ContractDrawer";
import { getContracts } from "../features/db/contract/api";
import {
  fmtDate,
  fmtDateOnly,
  maskCard,
  toCSV,
  downloadCSV,
} from "../utils/contractUtils";

/* ------------------------------ hooks ------------------------------ */
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* --------------------------------- page --------------------------------- */
export default function Contract() {
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [startInEdit, setStartInEdit] = useState(false);

  const [q, setQ] = useState("");
  const qDebounced = useDebounced(q, 200);
  const [onlyActive, setOnlyActive] = useState(false);
  const [sortByDateDesc, setSortByDateDesc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getContracts();
        setContracts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        toast.error("Failed to load contracts.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = qDebounced.trim().toLowerCase();
    let rows = contracts;

    if (needle) {
      rows = rows.filter((c) => {
        const name = `${c?.firstName || ""} ${c?.lastName || ""}`.toLowerCase();
        return (
          name.includes(needle) ||
          String(c?.email || "")
            .toLowerCase()
            .includes(needle) ||
          String(c?.contractId || "")
            .toLowerCase()
            .includes(needle)
        );
      });
    }
    if (onlyActive) {
      rows = rows.filter(
        (c) => String(c?.status || "").toLowerCase() === "active"
      );
    }

    rows = [...rows].sort((a, b) => {
      const da =
        typeof a?.createdAt?.toDate === "function"
          ? a.createdAt.toDate()
          : new Date(a?.createdAt || 0);
      const db =
        typeof b?.createdAt?.toDate === "function"
          ? b.createdAt.toDate()
          : new Date(b?.createdAt || 0);
      const na = da.getTime() || 0;
      const nb = db.getTime() || 0;
      return sortByDateDesc ? nb - na : na - nb;
    });

    return rows;
  }, [contracts, qDebounced, onlyActive, sortByDateDesc]);

  const openCreate = () => {
    setSelected(null);
    setStartInEdit(true);
    setIsOpen(true);
  };

  const openView = (c) => {
    setSelected(c);
    setStartInEdit(false);
    setIsOpen(true);
  };

  const openEdit = (c) => {
    setSelected(c);
    setStartInEdit(true);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setStartInEdit(false);
    // optional: keep selection so re-open uses last selected, or reset it:
    // setSelected(null);
  };

  const onSaved = (updated) => {
    setContracts((rows) => {
      const id = updated.id || updated.contractId;
      const idx = rows.findIndex((r) => (r.id || r.contractId) === id);
      if (idx >= 0) {
        const next = rows.slice();
        next[idx] = { ...rows[idx], ...updated };
        return next;
      }
      return [{ ...updated }, ...rows];
    });
  };

  const handleExport = () => {
    try {
      setExporting(true);
      downloadCSV(filtered);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <Header header={"Manage Contracts"} />

      <div className="max-w-screen-2xl mx-auto">
        <div className="mx-4 sm:mx-9 my-3">
          {/* Top Bar */}
          <div className="flex flex-wrap gap-4 justify-between bg-white text-gray-700 px-4 py-2">
            <div className="max-w-xs w-full">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-700"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
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
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="block w-full px-4 py-2 outline-none pl-10 text-sm text-gray-700 border border-black rounded-full focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by name, email or ref id"
                  aria-label="Search contracts"
                />
              </div>
            </div>

            <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setOnlyActive((v) => !v)}
                className={`px-5 py-2 border border-black text-xs rounded-md font-medium ${
                  onlyActive ? "bg-black text-white" : ""
                }`}
                aria-pressed={onlyActive}
              >
                {onlyActive ? "Showing Active" : "Active Contracts"}
              </button>

              <button
                type="button"
                onClick={() => setSortByDateDesc((v) => !v)}
                className="px-5 py-2 border border-black text-xs rounded-md font-medium"
              >
                Sort by: {sortByDateDesc ? "Newest" : "Oldest"}
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting || (!loading && filtered.length === 0)}
                className="px-5 py-2 border border-black text-xs rounded-md font-medium disabled:opacity-50"
                title="Export current view as CSV"
              >
                {exporting ? "Preparing…" : "Download .csv"}
              </button>

              <button
                type="button"
                onClick={openCreate}
                className="px-5 py-2 border border-black text-xs rounded-md font-semibold bg-black text-white"
              >
                + New Contract
              </button>
            </div>
          </div>

          {/* Desktop TABLE (md+) */}
          <div className="my-3 hidden md:block">
            <div className="relative overflow-x-auto drop-shadow-xl bg-white sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase border-b-2 border-secondary bg-white">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Ref ID</th>
                    <th className="px-6 py-3">Start Date</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Card</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`sk-${i}`} className="border-b border-secondary">
                        <td className="px-6 py-4">
                          <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
                          <div className="h-2 w-28 bg-gray-100 rounded mt-2 animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td className="px-6 py-6 text-gray-500" colSpan={7}>
                        No contracts found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((c, idx) => {
                      const key = c.id || c.contractId || idx;
                      return (
                        <tr
                          key={key}
                          className="border-b border-secondary hover:bg-primary/10"
                        >
                          <td className="px-6 py-4">
                            {(c.firstName || "-") + " " + (c.lastName || "")}
                            <div className="text-xs text-gray-500">
                              {c.email || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4">#{c.contractId || "-"}</td>
                          <td className="px-6 py-4">{fmtDate(c.createdAt)}</td>
                          <td className="px-6 py-4">{fmtDateOnly(c.date)}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-medium px-3 py-0.5 rounded-md ${
                                String(c.status || "").toLowerCase() ===
                                "active"
                                  ? "text-green-600 bg-green-500/10"
                                  : "text-gray-600 bg-gray-500/10"
                              }`}
                            >
                              {c.status || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {maskCard(c)}
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            <button
                              type="button"
                              onClick={() => openView(c)}
                              className="font-medium text-black bg-primary/20 px-3 py-0.5 rounded-md"
                            >
                              View
                            </button>
                            {/* Link -> button here avoids navigating to "#" */}
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="font-medium text-green-600 bg-green-500/10 px-3 py-0.5 rounded-md"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile CARD LIST (< md) */}
          <div className="md:hidden space-y-3">
            {loading && (
              <div className="p-4 bg-white rounded shadow text-gray-500">
                Loading…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="p-4 bg-white rounded shadow text-gray-500">
                No contracts found.
              </div>
            )}
            {!loading &&
              filtered.map((c, idx) => {
                const key = c.id || c.contractId || idx;
                return (
                  <div key={key} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        {(c.firstName || "-") + " " + (c.lastName || "")}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{c.contractId || "-"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.email || "-"}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <Info k="Start" v={fmtDate(c.createdAt)} />
                      <Info k="Due" v={fmtDateOnly(c.date)} />
                      <Info k="Status" v={c.status || "-"} />
                      <Info k="Card" v={maskCard(c)} />
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => openView(c)}
                        className="px-3 py-1 rounded bg-black text-white text-xs"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="px-3 py-1 rounded border text-xs"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <ContractDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        contract={selected} // null → create mode
        startInEdit={startInEdit}
        onSaved={onSaved}
      />
    </div>
  );
}

function Info({ k, v }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
