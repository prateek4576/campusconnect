import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  useEffect(() => {
    if (!user || loading) return;

    // Add an extra history entry for the current page.
    window.history.pushState(
      { campusConnectGuard: true },
      "",
      window.location.href
    );

    const handlePopState = () => {
      // Immediately restore the protected page.
      window.history.pushState(
        { campusConnectGuard: true },
        "",
        window.location.href
      );

      // Show confirmation instead of leaving the page.
      setShowLogoutConfirm(true);
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [user, loading, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="font-display text-2xl font-black uppercase">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleStay = () => {
    setShowLogoutConfirm(false);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);

    await logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <>
      {children}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div
            className="bg-[#FDFBF7] border-2 border-black brutal-shadow-lg w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="bg-[#E63946] text-white border-b-2 border-black p-5 flex items-center justify-between">
              <h2 className="font-display font-black text-2xl uppercase">
                Logout
              </h2>

              <button
                type="button"
                onClick={handleStay}
                className="bg-white text-black border-2 border-black px-3 py-1 font-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="p-6 md:p-8">
              <h3 className="font-display font-black text-3xl uppercase">
                Are you sure?
              </h3>

              <p className="mt-5 text-lg">
                Your lost items are going to miss you.
              </p>

              {/* BUTTONS */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  type="button"
                  onClick={handleStay}
                  className="bg-white text-black border-2 border-black px-5 py-4 brutal-shadow-sm brutal-press font-display font-black uppercase text-lg"
                >
                  Stay
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-[#E63946] text-white border-2 border-black px-5 py-4 brutal-shadow-sm brutal-press font-display font-black uppercase text-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}