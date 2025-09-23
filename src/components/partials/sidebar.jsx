import { SlHome } from "react-icons/sl";
import { BsCalendar2Event, BsPersonVcard } from "react-icons/bs";
import { RiCloseFill, RiLogoutCircleLine } from "react-icons/ri";
import { PiUsersLight } from "react-icons/pi";
import { TbCategory2 } from "react-icons/tb";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import { doSignOut } from "../../features/db/auth/api";
import { useAuth } from "../../auth/AuthContext";

export default function Sidebar() {
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { claims } = useAuth();

  // permissions helper (admins must also have the perm)
  const can = useMemo(() => {
    const role = (claims?.role || "staff").toLowerCase();
    const perms = Array.isArray(claims?.permissions) ? claims.permissions : [];
    return (perm) => {
      if (!perm) return true;
      return perms.includes(perm);
    };
  }, [claims]);

  // base link class (active vs default)
  const baseLink = ({ isActive }) =>
    isActive
      ? "flex items-center py-2 px-5 rounded-lg bg-primary drop-shadow text-white font-semibold"
      : "flex items-center py-2 px-5 text-gray-700 rounded-lg hover:bg-primary/5 drop-shadow hover:text-primary hover:font-medium outline-none";

  // compose class with permission hint (dim + no-pointer if no access, but keep clickable)
  const linkWithPerm = (perm) => (nav) => {
    const base = baseLink(nav);
    const noAccess = !can(perm) ? " opacity-60 cursor-default" : "";
    return base + noAccess;
  };

  const closeMenu = () => setShowMenu(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      const t = toast.loading("Signing out…");
      await doSignOut();
      toast.dismiss(t);
      toast.success("Signed out");
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
      setShowMenu(false);
    }
  };

  return (
    <>
      {/* Mobile hamburger */}
      <div className="px-4 sm:px-8 lg:hidden">
        <button
          type="button"
          onClick={() => setShowMenu(true)}
          className="flex items-center p-2 text-sm text-gray-150 bg-gray-150 bg-opacity-5 rounded-lg hover:bg-gray-100"
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            />
          </svg>
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 z-30 w-64 bg-white h-screen ${showMenu ? "" : "hidden"} lg:block`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {showMenu && (
            <button
              className="float-right bg-gray-150 rounded-full text-xl text-white"
              onClick={() => setShowMenu(false)}
              aria-label="Close sidebar"
              title="Close"
            >
              <RiCloseFill />
            </button>
          )}

          <div className="flex flex-col justify-between h-full">
            <ul className="space-y-2 font-normal text-sm">
              <li className="py-3">
                <NavLink to="/" className="flex items-center justify-center py-2 rounded-lg" onClick={closeMenu}>
                  <h1 className="text-primary text-3xl font-semibold capitalize">Xplore Rentals</h1>
                </NavLink>
              </li>

              {/* Dashboard (example perm: view_reports). If you don't gate dashboard, use baseLink instead. */}
              <li>
                <NavLink
                  to="/"
                  className={linkWithPerm("view_reports")}
                  onClick={closeMenu}
                  title={!can("view_reports") ? "No access" : undefined}
                >
                  <SlHome />
                  <span className="flex-1 ml-3 whitespace-nowrap">Dashboard</span>
                </NavLink>
              </li>

              {/* Users + manage_users */}
              <li>
                <NavLink
                  to="/users"
                  className={linkWithPerm("manage_users")}
                  onClick={closeMenu}
                  title={!can("manage_users") ? "No access" : undefined}
                >
                  <PiUsersLight />
                  <span className="flex-1 ml-3 whitespace-nowrap">Users</span>
                </NavLink>
              </li>

              {/* Contracts + manage_contracts */}
              <li>
                <NavLink
                  to="/contract"
                  className={linkWithPerm("manage_contracts")}
                  onClick={closeMenu}
                  title={!can("manage_contracts") ? "No access" : undefined}
                >
                  <TbCategory2 />
                  <span className="flex-1 ml-3 whitespace-nowrap">Contracts</span>
                </NavLink>
              </li>

              {/* FAQs + manage_faqs */}
              <li>
                <NavLink
                  to="/faqs"
                  className={linkWithPerm("manage_faqs")}
                  onClick={closeMenu}
                  title={!can("manage_faqs") ? "No access" : undefined}
                >
                  <BsPersonVcard />
                  <span className="flex-1 ml-3 whitespace-nowrap">FAQs</span>
                </NavLink>
              </li>

              {/* App Settings + pick a perm; reusing manage_faqs */}
              <li>
                <NavLink
                  to="/content"
                  className={linkWithPerm("manage_faqs")}
                  onClick={closeMenu}
                  title={!can("manage_faqs") ? "No access" : undefined}
                >
                  <BsCalendar2Event />
                  <span className="flex-1 ml-3 whitespace-nowrap">App Settings</span>
                </NavLink>
              </li>
            </ul>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center px-5 py-2 rounded-lg bg-primary/80 text-white gap-2.5 cursor-pointer font-medium drop-shadow hover:font-medium disabled:opacity-60"
                aria-label="Sign out"
                title="Sign out"
              >
                <RiLogoutCircleLine />
                <p>{loggingOut ? "Signing out…" : "Logout"}</p>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
