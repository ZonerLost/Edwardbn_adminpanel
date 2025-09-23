import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Header from "../components/partials/header";
import FaqDrawer from "../components/faq/FaqDrawer";
import { getFaqs, deleteFaq } from "../features/db/faq/api";
import FaqTable from "../components/faq/FaqTable";
import FaqTableSkeleton from "../components/faq/FaqTableSkeleton";
import FaqListMobile from "../components/faq/FaqListMobile";
import { fmtDate, toCSV, downloadCSV } from "../utils/faqutills"

/* ------------------------------ hooks ------------------------------ */
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ---------------------------------- page ---------------------------------- */
export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [startInEdit, setStartInEdit] = useState(false);

  const [q, setQ] = useState("");
  const qDebounced = useDebounced(q, 200);

  const [onlyPublished, setOnlyPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getFaqs();
        setFaqs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const needle = qDebounced.trim().toLowerCase();
    let rows = faqs;

    if (needle) {
      rows = rows.filter(
        (f) =>
          String(f?.title || "")
            .toLowerCase()
            .includes(needle) ||
          String(f?.answer || "")
            .toLowerCase()
            .includes(needle)
      );
    }
    if (onlyPublished) {
      rows = rows.filter(
        (f) => String(f?.status || "").toLowerCase() === "published"
      );
    }
    return rows;
  }, [faqs, qDebounced, onlyPublished]);

  const openCreate = () => {
    setSelected(null);
    setStartInEdit(true);
    setIsOpen(true);
  };
  const openView = (f) => {
    setSelected(f);
    setStartInEdit(false);
    setIsOpen(true);
  };
  const openEdit = (f) => {
    setSelected(f);
    setStartInEdit(true);
    setIsOpen(true);
  };
  const closeDrawer = () => {
    setIsOpen(false);
    setStartInEdit(false);
  };

  const handleDeleteRow = async (faq) => {
    if (!faq?.id) return;
    if (!confirm("Delete this FAQ? This cannot be undone.")) return;

    try {
      await toast.promise(deleteFaq(faq.id), {
        loading: "Deleting…",
        success: "FAQ deleted",
        error: "Failed to delete FAQ",
      });
      setFaqs((rows) => rows.filter((r) => r.id !== faq.id));
      if (selected?.id === faq.id) setIsOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const onSaved = (updated) => {
    setFaqs((rows) => {
      const exists = rows.some((r) => r.id === updated.id);
      return exists
        ? rows.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
        : [{ ...updated }, ...rows];
    });
    setSelected((cur) => (cur ? { ...cur, ...updated } : updated));
  };

  const onDeleted = (deletedId) => {
    setFaqs((rows) => rows.filter((r) => r.id !== deletedId));
    setSelected(null);
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
      <Header header={"Manage FAQs"} />

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
                  placeholder="Search FAQs…"
                  aria-label="Search FAQs"
                />
              </div>
            </div>

            <div className="flex flex-col w-full sm:w-auto sm:flex-row sm:items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setOnlyPublished((v) => !v)}
                className={`px-5 py-2 border border-black text-xs rounded-md font-medium ${
                  onlyPublished ? "bg-black text-white" : ""
                }`}
                aria-pressed={onlyPublished}
              >
                {onlyPublished ? "Showing Published" : "Published"}
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
                + Add FAQ
              </button>
            </div>
          </div>

          {/* Desktop table (md+) */}
          <div className="my-3 hidden md:block">
            {loading ? (
              <FaqTableSkeleton rows={5} />
            ) : (
              <FaqTable
                rows={filtered}
                fmtDate={fmtDate}
                onView={openView}
                onEdit={openEdit}
                onDelete={handleDeleteRow}
              />
            )}
          </div>

          {/* Mobile list (< md) */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <FaqListMobile loading />
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="p-4 bg-white rounded shadow text-gray-500">
                  No FAQs found.
                </div>
              </div>
            ) : (
              <FaqListMobile
                rows={filtered}
                fmtDate={fmtDate}
                onView={openView}
                onEdit={openEdit}
                onDelete={handleDeleteRow}
              />
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      <FaqDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        faq={selected} // null → create mode
        startInEdit={startInEdit}
        onSaved={onSaved}
        onDeleted={onDeleted}
      />
    </div>
  );
}
