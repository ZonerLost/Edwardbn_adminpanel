import React from "react";

function Row({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value || "-"}</span>
    </div>
  );
}

export default function DetailsView({ user }) {
  const fmt = (v) => {
    try {
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
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div>
          <div>
            <Row label="Full name" value={user?.displayName || "-"} />
          </div>
          <div className=" mt-1.5 text-gray-600">
            {" "}
            <Row label="Gmail" value={user?.email || "-"} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Phone" value={user?.phoneNumber} />
        <Row label="Role" value={user?.role} />
        <Row label="Status" value={user?.status} />
        <Row label="Joined" value={fmt(user?.createdAt)} />
      </div>
      {Array.isArray(user?.permissions) && user.permissions.length > 0 && (
        <div>
          <div className="font-medium">Permissions</div>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {user.permissions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
