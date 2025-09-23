import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// helper
const hasAll = (granted = [], required) => {
  if (!required) return true;
  const need = Array.isArray(required) ? required : [required];
  return need.every((p) => granted.includes(p));
};

/**
 * Auth + role + permission guard.
 * - allowStaff: if true, staff can pass base gate (default true).
 * - requirePerm: string | string[] of permission keys required to access this route.
 */
export default function ProtectedRoute({ allowStaff = true, requirePerm }) {
  const { user, claims, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // or a full-screen spinner

  // Not signed in -> login
  if (!user)
    return <Navigate to="/login" state={{ redirectTo: loc.pathname }} replace />;

  const role = (claims?.role || "staff").toLowerCase();
  const status = (claims?.status || "active").toLowerCase();
  const perms = Array.isArray(claims?.permissions) ? claims.permissions : [];

  // Base role + status check
  const roleOK = role === "admin" || (allowStaff && role === "staff");
  if (!roleOK || status !== "active") {
    const reason = !roleOK ? "forbidden" : "inactive";
    return (
      <Navigate
        to="/no-access"
        replace
        state={{ from: loc.pathname, reason }}
      />
    );
  }

  // Permission check (admins must also have explicit permission)
  if (!hasAll(perms, requirePerm)) {
    return (
      <Navigate
        to="/no-access"
        replace
        state={{ from: loc.pathname, reason: "missing-permission", required: requirePerm || null }}
      />
    );
  }

  return <Outlet />;
}
