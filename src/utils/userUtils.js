/** Format a date-like value as "MMM DD, YYYY" (e.g., "Sep 19, 2025"). */
export function fmtDate(v) {
  try {
    if (!v) return "-";
    const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

/** Convert an array of user rows to CSV (uid, displayName, email, phoneNumber, role, status, createdAt). */
export function toCSV(rows = []) {
  const headers = ["uid", "displayName", "email", "phoneNumber", "role", "status", "createdAt"];
  const escape = (s) => `"${String(s ?? "").replaceAll('"', '""')}"`;

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((u) =>
      [
        u.id || u.uid || "",
        u.displayName || "",
        u.email || "",
        u.phoneNumber || "",
        u.role || "",
        u.status || "",
        typeof u?.createdAt?.toDate === "function"
          ? u.createdAt.toDate().toISOString()
          : u?.createdAt
          ? new Date(u.createdAt).toISOString()
          : "",
      ]
        .map(escape)
        .join(",")
    ),
  ];

  return lines.join("\n");
}

/** Trigger a client-side CSV download of the provided user rows. */
export function downloadCSV(rows = []) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
