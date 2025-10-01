import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { doSignOut } from "../../features/db/auth/api";
import { useAuth } from "../../auth/AuthContext";

export default function Header({ header, link = "/", arrow = false }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  const displayName = profile?.displayName || user?.displayName || "Admin";
  const email = profile?.email || user?.email || "—";
  const avatar =
    (typeof profile?.photoURL === "string" && profile.photoURL) ||
    user?.photoURL ||
    "https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg?auto=compress&cs=tinysrgb&w=1600";

  // Close dropdown on outside click / ESC
  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleLogout() {
    try {
      await doSignOut();
      navigate("/login", { replace: true });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="bg-white">
      <nav className="text-gray-900">
        <div className="flex flex-wrap items-center justify-between px-4 py-9 sm:p-8">
          <div className="flex items-center drop-shadow-lg">
            <Link to={link}>
              <div className="flex items-center gap-1">
                {arrow && <IoArrowBack className="w-5 h-5" />}
                <span className="self-center text-xl sm:text-2xl font-semibold whitespace-nowrap capitalize">
                  {header}
                </span>
              </div>
            </Link>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              ref={btnRef}
              type="button"
              className="flex items-center gap-2 text-sm rounded-full"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <img
                className="rounded-full w-9 h-9 object-cover border"
                loading="lazy"
                src={avatar}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.pexels.com/photos/1499327/pexels-photo-1499327.jpeg?auto=compress&cs=tinysrgb&w=1600";
                }}
                alt={displayName}
              />
              <span className="hidden sm:block">{displayName}</span>
            </button>

            <div
              ref={menuRef}
              role="menu"
              className={`absolute right-0 mt-3 w-48 z-50 ${
                open ? "" : "hidden"
              } bg-white shadow-lg rounded-lg border`}
            >
              <ul className="py-1 text-sm">
                <li>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
              <div className="px-4 py-2 text-[11px] text-gray-500 border-t">
                {email}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
