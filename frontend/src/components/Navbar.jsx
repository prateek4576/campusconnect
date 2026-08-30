import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import api from "../lib/api";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/report/lost", label: "Report Lost" },
  { to: "/report/found", label: "Report Found" },
  { to: "/messages", label: "Messages" },
  { to: "/about", label: "About" },
  { to: "/account", label: "My Account" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const { data } = await api.get("/messages/unread-count");

      setUnreadCount(data?.count || 0);
    } catch (error) {
      console.error("Failed to load unread message count", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // NEW
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    nav("/login");
  };

  if (!user) return null;

  return (
    <>
      <header className="bg-[#FDFBF7] border-b-2 border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E63946] border-2 border-black flex items-center justify-center brutal-shadow-sm">
              <span className="font-display font-black text-white text-lg md:text-xl">
                C
              </span>
            </div>

            <span className="font-display font-black text-xl md:text-2xl tracking-tight uppercase">
              CampusConnect
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 font-semibold text-sm uppercase tracking-wide border-2 border-transparent hover:border-black transition-all ${
                    isActive ? "bg-[#E9C46A] border-black brutal-shadow-sm" : ""
                  }`
                }
              >
                <span className="flex items-center gap-2">
                  {l.label}

                  {l.to === "/messages" && unreadCount > 0 && (
                    <span className="bg-[#E63946] text-white border-2 border-black min-w-[22px] h-5 px-1 flex items-center justify-center text-[10px] font-black brutal-shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}

            {/* LOGOUT BUTTON */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="ml-2 px-3 py-2 bg-black text-white border-2 border-black brutal-shadow-sm brutal-press font-semibold text-sm uppercase flex items-center gap-2"
            >
              <LogOut size={14} />
              Logout
            </button>
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 border-2 border-black"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden border-t-2 border-black bg-[#FDFBF7] px-4 py-3 flex flex-col gap-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 font-semibold uppercase border-2 ${
                    isActive
                      ? "border-black bg-[#E9C46A]"
                      : "border-transparent"
                  }`
                }
              >
                <span className="flex items-center justify-between">
                  {l.label}

                  {l.to === "/messages" && unreadCount > 0 && (
                    <span className="bg-[#E63946] text-white border-2 border-black min-w-[24px] h-6 px-1 flex items-center justify-center text-xs font-black">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}

            {/* MOBILE LOGOUT */}
            <button
              onClick={() => {
                setOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="px-3 py-2 bg-black text-white border-2 border-black font-semibold uppercase text-left"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Logout"
          message="Your lost items are going to miss you."
          confirmText="Logout"
          showFunnyMessage={true}
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={async () => {
            setShowLogoutConfirm(false);
            await handleLogout();
          }}
        />
      )}
    </>
  );
}
