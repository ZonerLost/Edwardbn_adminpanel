/** Format a date-like value as "MMM DD, YYYY, HH:MM". */
export function fmtDate(v) {
  try {
    if (!v) return "-";
    const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

/** Build a CSV string for FAQ rows (id, title, answer, status, createdAt, updatedAt). */
export function toCSV(rows = []) {
  const headers = ["id", "title", "answer", "status", "createdAt", "updatedAt"];

  const escape = (s) => `"${String(s ?? "").replaceAll('"', '""')}"`;

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((f) => {
      const created =
        typeof f?.createdAt?.toDate === "function"
          ? f.createdAt.toDate().toISOString()
          : f?.createdAt
          ? new Date(f.createdAt).toISOString()
          : "";
      const updated =
        typeof f?.updatedAt?.toDate === "function"
          ? f.updatedAt.toDate().toISOString()
          : f?.updatedAt
          ? new Date(f.updatedAt).toISOString()
          : "";

      return [
        f.id || "",
        f.title || "",
        String(f.answer || "").replace(/\r?\n/g, " "), // flatten to one line
        f.status || "",
        created,
        updated,
      ]
        .map(escape)
        .join(",");
    }),
  ];

  return lines.join("\n");
}

/** Trigger a client-side CSV download of the provided FAQ rows. */
export function downloadCSV(rows = []) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `faqs-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
