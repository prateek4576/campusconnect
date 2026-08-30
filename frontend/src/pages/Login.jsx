import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Login() {
  const { login, formatApiErrorDetail } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      // ==========================================
      // ADMIN LOGIN
      // ==========================================
      if (email.trim() === "admin") {
        const { data } = await api.post("/admin/login", {
          admin_id: email.trim(),
          password: password,
        });

        // Save admin token
        localStorage.setItem("cc_admin_token", data.token);

        // Go to admin dashboard
        nav("/admin/dashboard");

        return;
      }

      // ==========================================
      // NORMAL USER LOGIN
      // ==========================================
      await login(email, password);

      nav("/dashboard");

    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) ||
        e.message ||
        "Login failed"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-6xl">

        {/* BACK TO CAMPUSCONNECT */}
        <Link
          to="/"
          className="font-display font-black text-2xl uppercase inline-block mb-6"
        >
          ← CampusConnect
        </Link>

        {/* ================================================= */}
        {/* TWO COLUMN LAYOUT */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">

          {/* ================================================= */}
          {/* WELCOME / INFORMATION CARD */}
          {/* ================================================= */}

          <div className="bg-[#0B294B] text-white border-2 border-black brutal-shadow-lg p-8 w-full lg:w-3/5">

            {/* LABEL */}
            <div className="inline-block bg-[#F2C75C] text-black border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest mb-5">
              Welcome Back
            </div>

            {/* HEADING */}
            <h2 className="font-display font-black text-3xl uppercase leading-tight mb-4">
              Your CampusConnect Account
            </h2>

            <p className="text-sm leading-relaxed mb-8">
              Your account keeps your lost &amp; found activity,
              messages, and reports in one place.
            </p>


        


            {/* ================================================= */}
            {/* YOUR PRIVACY */}
            {/* ================================================= */}

            <div className="border-t-2 border-white/40 pt-5 mb-7">

              <h3 className="font-display font-black text-xl uppercase mb-3">
                Your Privacy
              </h3>

              <ul className="space-y-3 text-sm leading-relaxed">

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Your account information is used only to provide
                    CampusConnect services.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Your messages are private between you and the
                    other user.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>We do not sell your personal information.</strong>
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>Never share your password with anyone.</strong>
                  </span>
                </li>

              </ul>

            </div>

          </div>


          {/* ================================================= */}
          {/* LOGIN CARD */}
          {/* ================================================= */}

          <div className="bg-white border-2 border-black brutal-shadow-lg p-8 w-full lg:w-2/5">

            <h1 className="font-display font-black text-3xl uppercase mb-2">
              Welcome Back
            </h1>

            <p className="text-sm mb-6">
              Log in to report or browse items.
            </p>


            <form onSubmit={submit} className="space-y-4">

              {/* EMAIL / ADMIN ID */}
              <div>

                <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                  Email
                </label>

                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                  placeholder="you@gmail.com"
                />

              </div>


              {/* PASSWORD */}
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
                  placeholder="••••••••"
                />

              </div>


              {/* ERROR */}
              {error && (
                <div className="bg-[#E63946] text-white border-2 border-black px-3 py-2 text-sm font-semibold">
                  {error}
                </div>
              )}


              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-black text-white border-2 border-black px-4 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60"
              >
                {busy ? "Signing in…" : "Log In"}
              </button>

            </form>


            {/* SIGN UP */}
            <p className="mt-6 text-sm">

              Don&apos;t have an account?{" "}

              <Link
                to="/signup"
                className="font-bold underline"
              >
                Sign up
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}