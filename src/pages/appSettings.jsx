import React, { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/partials/header";
import { toast } from "react-hot-toast";
import TipTapEditor from "../components/editor/TipTapEditor";
import { getPage, savePage } from "../features/db/cms/api";

const PAGES = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms",   label: "Terms & Conditions" },
];

// simple debounce
function useDebounced(value, delay = 800) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

export default function Appsettings() {
  const [active, setActive] = useState(PAGES[0].key);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const doc = await getPage(active);
        setContent(doc?.html || "");
        setLastSaved(doc?.updatedAt || null);
        setDirty(false);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    })();
  }, [active]);

  const debounced = useDebounced(content, 900);
  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    if (!dirty) return;
    (async () => {
      try {
        setSaving(true);
        await savePage(active, { html: debounced, title: active });
        setLastSaved(new Date());
      } catch (e) {
        console.error(e);
        toast.error("Auto-save failed");
      } finally {
        setSaving(false);
      }
    })();
  }, [debounced, dirty, active]);

  const saveNow = async () => {
    try {
      setSaving(true);
      await toast.promise(savePage(active, { html: content, title: active }), {
        loading: "Saving…", success: "Saved", error: "Failed to save",
      });
      setDirty(false);
      setLastSaved(new Date());
    } finally { setSaving(false); }
  };

  return (
    <div>
      <Header header={"Manage content"} />
      <div className="max-w-screen-2xl mx-auto">
        <div className="mx-4 sm:mx-9 my-3">
          <div className="flex flex-wrap gap-2 bg-white px-4 py-2 text-black rounded items-center">
            {PAGES.map(p => (
              <button key={p.key} type="button" onClick={() => setActive(p.key)}
                className={[
                  "rounded-md text-sm px-6 py-2 font-medium capitalize border",
                  active === p.key ? "bg-black text-white border-black" : "bg-white border-black",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              {saving ? (
                <span className="text-xs text-gray-600">Saving…</span>
              ) : lastSaved ? (
                <span className="text-xs text-gray-500">
                  Saved{dirty ? " (unsaved changes)" : ""} •{" "}
                  {new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(lastSaved)}
                </span>
              ) : null}
              <button type="button" onClick={saveNow}
                disabled={saving || !dirty}
                className="rounded-md text-sm px-4 py-2 font-medium border border-black disabled:opacity-50">
                Save
              </button>
            </div>
          </div>

          <div className="my-3">
            <div className="bg-white rounded shadow">
              {loading ? (
                <div className="p-4 space-y-3">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-5/6 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              ) : (
                <TipTapEditor
                  value={content}
                  onChange={(html) => { setContent(html); setDirty(true); }}
                  placeholder={`Write your ${active} here…`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
