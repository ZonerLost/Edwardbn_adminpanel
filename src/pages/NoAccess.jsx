import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function fmtPerms(perms) {
  if (!perms || (Array.isArray(perms) && perms.length === 0)) return "none";
  const list = Array.isArray(perms) ? perms : [perms];
  return list.join(", ");
}

export default function NoAccess() {
  const { state } = useLocation();
  const { claims } = useAuth();

  const role = (claims?.role || "staff").toLowerCase();
  const status = (claims?.status || "active").toLowerCase();
  const have = Array.isArray(claims?.permissions) ? claims.permissions : [];

  const from = state?.from || "/";
  const required = state?.required || null;
  const reason = state?.reason || "missing-permission";

  return (
    <div className="max-w-2xl mx-auto mt-20 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold">No Access</h1>
      <p className="mt-2 text-gray-700">
        You’re signed in, but your account doesn’t have access to this page.
      </p>

      <div className="mt-4 text-sm text-gray-800 space-y-2">
        <p>
          <span className="font-medium">Tried to open:</span>{" "}
          <code className="px-1.5 py-0.5 bg-gray-100 rounded">{from}</code>
        </p>
        <p>
          <span className="font-medium">Your role:</span> {role}{" "}
          <span className="text-gray-500">(status: {status})</span>
        </p>
        <p>
          <span className="font-medium">Your permissions:</span> {fmtPerms(have)}
        </p>
        {required && (
          <p>
            <span className="font-medium">Required permission(s):</span> {fmtPerms(required)}
          </p>
        )}
        {reason === "inactive" && (
          <p className="text-red-600">Your account is not active. Contact an administrator.</p>
        )}
      </div>

      <ul className="mt-4 list-disc list-inside text-sm text-gray-700 space-y-1">
        <li>Ask an administrator to grant the required permission(s) to your account.</li>
        <li>Try another section from the sidebar that matches your permissions.</li>
      </ul>

      <div className="mt-6 flex gap-3">
        <Link to="/" className="px-4 py-2 rounded border">Go to dashboard</Link>
        <Link to={from} className="px-4 py-2 rounded bg-black text-white">Retry</Link>
      </div>
    </div>
  );
}

