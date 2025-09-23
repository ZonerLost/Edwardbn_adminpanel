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

/** Format just the date part as "MMM DD, YYYY". */
export function fmtDateOnly(v) {
  try {
    const d = typeof v?.toDate === "function" ? v.toDate() : new Date(v);
    return Number.isNaN(d.getTime())
      ? String(v || "-")
      : new Intl.DateTimeFormat(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }).format(d);
  } catch {
    return String(v || "-");
  }
}

/** Mask card for display using last 4 digits from either cardNumber or cardLast4. */
export function maskCard({ cardNumber, cardLast4 } = {}) {
  const last4 = cardLast4
    ? String(cardLast4).replace(/\D+/g, "").slice(-4)
    : String(cardNumber || "").replace(/\D+/g, "").slice(-4);
  if (!last4) return "-";
  return `•••• •••• •••• ${last4}`;
}

/** Convert contract rows to CSV (contractId, first/last, email, phone, status, dueDate, createdAt, cardLast4). */
export function toCSV(rows = []) {
  const headers = [
    "contractId",
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "status",
    "dueDate",
    "createdAt",
    "cardLast4",
  ];

  const escape = (s) => `"${String(s ?? "").replaceAll('"', '""')}"`;

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((c) => {
      const created =
        typeof c?.createdAt?.toDate === "function"
          ? c.createdAt.toDate().toISOString()
          : c?.createdAt
          ? new Date(c.createdAt).toISOString()
          : "";

      const last4 =
        (c?.cardLast4 && String(c.cardLast4)) ||
        String(c?.cardNumber || "").replace(/\D+/g, "").slice(-4);

      return [
        c?.contractId || c?.id || "",
        c?.firstName || "",
        c?.lastName || "",
        c?.email || "",
        c?.phoneNumber || "",
        c?.status || "",
        c?.date || "",
        created,
        last4,
      ]
        .map(escape)
        .join(",");
    }),
  ];

  return lines.join("\n");
}

/** Trigger a client-side CSV download of the provided contract rows. */
export function downloadCSV(rows = []) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `contracts-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
