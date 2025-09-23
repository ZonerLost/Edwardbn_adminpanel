import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { createFaq, updateFaq, deleteFaq } from "../../features/db/faq/api";

/**
 * Props:
 * - isOpen, onClose
 * - faq?: object
 * - startInEdit?: boolean
 * - onSaved?: (faq) => void
 * - onDeleted?: (deletedId) => void     // <-- NEW
 */
export default function FaqDrawer({ isOpen, onClose, faq, startInEdit = false, onSaved, onDeleted }) {
  const isCreate = !faq;
  const [editing, setEditing] = useState(isCreate || startInEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false); // <-- NEW

  const [form, setForm] = useState({ title: "", answer: "", status: "" });

  useEffect(() => { setEditing(isCreate || startInEdit); }, [isCreate, startInEdit]);

  useEffect(() => {
    if (!isOpen) return;
    if (faq) setForm({ title: faq.title || "", answer: faq.answer || "", status: faq.status || "" });
    else setForm({ title: "", answer: "", status: "" });
  }, [isOpen, faq]);

  if (!isOpen) return null;

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaving(true);
      if (!form.title.trim()) return toast.error("Please enter a title.");
      if (!form.answer.trim()) return toast.error("Please enter an answer.");
      if (!form.status) return toast.error("Please select status.");

      const payload = {
        title: form.title.trim(),
        answer: form.answer.trim(),
        status: form.status,
      };

      const p = isCreate ? createFaq(payload) : updateFaq(faq.id, payload);

      const result = await toast.promise(
        p,
        { loading: isCreate ? "Creating FAQ…" : "Saving changes…", success: isCreate ? "FAQ created" : "FAQ updated", error: "Failed to save FAQ" }
      );

      onSaved?.(result);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isCreate || !faq?.id) return;
    if (!confirm("Delete this FAQ? This cannot be undone.")) return;

    try {
      setDeleting(true);
      await toast.promise(
        deleteFaq(faq.id),
        { loading: "Deleting…", success: "FAQ deleted", error: "Failed to delete FAQ" }
      );
      onDeleted?.(faq.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Transparent overlay (no dim) */}
      <button aria-label="Close" className="fixed inset-0 bg-transparent" onClick={onClose} />

      {/* Drawer */}
      <div className="ml-auto h-full w-full sm:w-[560px] bg-white shadow-xl overflow-y-auto motion-safe:transition-transform motion-safe:duration-300" style={{ transform: "translateX(0)" }}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">{isCreate ? "New FAQ" : "FAQ Details"}</h2>

          <div className="flex items-center gap-2">
            {!isCreate && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-60"
                title="Delete FAQ"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}

            {!editing ? (
              <button className="px-3 py-1 rounded bg-black text-white text-sm" onClick={() => setEditing(true)}>
                Edit
              </button>
            ) : (
              <>
                <button
                  className="px-3 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : isCreate ? "Create" : "Save"}
                </button>
                <button className="px-3 py-1 rounded border text-sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </>
            )}

            <button className="text-gray-600 hover:text-black" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {editing ? (
            <form className="grid grid-cols-1 gap-4" onSubmit={(e) => e.preventDefault()}>
              <TextField label="Title" name="title" value={form.title} onChange={onChange} placeholder="e.g. Is there a free trial available?" />
              <TextArea label="Answer" name="answer" value={form.answer} onChange={onChange} placeholder="Type the answer customers should see…" rows={6} />
              <SelectField label="Status" name="status" value={form.status} onChange={onChange} options={["published", "draft", "archived"]} placeholder="Select status" />
            </form>
          ) : (
            <DetailsView faq={faq} />
          )}
        </div>
      </div>
    </div>
  );
}

/* subcomponents unchanged from previous message */
function TextField({ label, placeholder, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input {...props} placeholder={placeholder} className="w-full border rounded px-3 py-2" />
    </div>
  );
}

function TextArea({ label, placeholder, rows = 5, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <textarea {...props} rows={rows} placeholder={placeholder} className="w-full border rounded px-3 py-2 resize-y" />
    </div>
  );
}

function SelectField({ label, options = [], placeholder, value, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select {...props} value={value} className="w-full border rounded px-3 py-2">
        <option value="" disabled>{placeholder || "Select…"}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DetailsView({ faq }) {
  const fmtDateTime = (v) => {
    try {
      const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
      if (Number.isNaN(d.getTime())) return "-";
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit",
      }).format(d);
    } catch { return "-"; }
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      <p><strong>Title:</strong> {faq?.title || "-"}</p>
      <div>
        <strong>Answer:</strong>
        <p className="mt-1 whitespace-pre-line">{faq?.answer || "-"}</p>
      </div>
      <p><strong>Status:</strong> {faq?.status || "-"}</p>
      <p><strong>Created At:</strong> {fmtDateTime(faq?.createdAt)}</p>
      <p><strong>Updated At:</strong> {fmtDateTime(faq?.updatedAt)}</p>
    </div>
  );
}
