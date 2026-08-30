import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setBusy(true);

    try {
      const { data } = await api.post("/admin/login", {
        admin_id: adminId,
        password,
      });

      localStorage.setItem("admin_token", data.token);

      navigate("/admin");
    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) ||
        "Invalid admin credentials"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <Link
          to="/"
          className="font-display font-black text-2xl uppercase inline-block mb-6"
        >
          ← CampusConnect
        </Link>

        <div className="bg-white border-2 border-black brutal-shadow-lg p-8">

          <div className="inline-block bg-[#E63946] text-white border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest brutal-shadow-sm mb-4">
            Administrator
          </div>

          <h1 className="font-display font-black text-3xl uppercase mb-2">
            Admin Login
          </h1>

          <p className="text-sm mb-6">
            Authorized administrators only.
          </p>

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                Admin ID
              </label>

              <input
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                placeholder="Admin ID"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                placeholder="Password"
              />
            </div>

            {error && (
              <div className="bg-[#E63946] text-white border-2 border-black px-3 py-2 text-sm font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-black text-white border-2 border-black px-4 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60"
            >
              {busy ? "Signing in..." : "Admin Login"}
            </button>

          </form>

          <Link
            to="/"
            className="block mt-6 text-sm font-bold underline"
          >
            Back to website
          </Link>

        </div>
      </div>
    </div>
  );
}