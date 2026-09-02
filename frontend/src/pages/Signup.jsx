import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { register, googleLogin, formatApiErrorDetail } = useAuth();

  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // =====================================================
  // GOOGLE LOGIN / SIGNUP
  // =====================================================

  const handleGoogleLogin = () => {
    if (!window.google) {
      setError("Google Sign-In is not available. Please try again.");
      return;
    }

    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      setError("Google authentication is not configured.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,

      callback: async (response) => {
        setError("");
        setBusy(true);

        try {
          await googleLogin(response.credential);

          nav("/dashboard");
        } catch (e) {
          setError(
            formatApiErrorDetail(e.response?.data?.detail) ||
              "Google sign-in failed",
          );
        } finally {
          setBusy(false);
        }
      },
    });

    window.google.accounts.id.prompt();
  };

  // =====================================================
  // FINAL SIGNUP
  // =====================================================

 // =====================================================
// MANUAL SIGNUP
// =====================================================

const submit = async (e) => {
  e.preventDefault();

  setError("");
  setBusy(true);

  try {
    await register(
      form.name,
      form.email,
      form.phone,
      form.password
    );

    nav("/dashboard");
  } catch (e) {
    setError(
      formatApiErrorDetail(
        e.response?.data?.detail
      ) ||
      e.message ||
      "Signup failed"
    );
  } finally {
    setBusy(false);
  }
};

  // =====================================================
  // MASK EMAIL
  // =====================================================

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
          {/* PRIVACY CARD */}
          {/* ================================================= */}

          <div className="bg-[#0B294B] text-white border-2 border-black brutal-shadow-lg p-8 w-full lg:w-3/5">
            <div className="inline-block bg-[#F2C75C] text-black border-2 border-black px-3 py-1 font-bold uppercase text-xs tracking-widest mb-5">
              Your Privacy
            </div>

            <h2 className="font-display font-black text-3xl uppercase leading-tight mb-4">
              Why We Ask For Your Information
            </h2>

            <p className="text-sm leading-relaxed mb-8">
              We only ask for the information needed to make CampusConnect
              useful, safe, and easy to use.
            </p>

            {/* EMAIL */}

            <div className="border-t-2 border-white/40 pt-5 mb-7">
              <h3 className="font-display font-black text-xl uppercase mb-3">
                Email
              </h3>

              <ul className="space-y-3 text-sm leading-relaxed">
                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Used to create and identify your CampusConnect account.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Used to log in to your account and keep it secure.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>We do not send promotional emails.</strong>
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>
                      Your email is not publicly shown on your posts.
                    </strong>
                  </span>
                </li>
              </ul>
            </div>

            {/* PASSWORD */}

            <div className="border-t-2 border-white/40 pt-5 mb-7">
              <h3 className="font-display font-black text-xl uppercase mb-3">
                Password
              </h3>

              <ul className="space-y-3 text-sm leading-relaxed">
                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Used to securely access your CampusConnect account.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>Your password is never displayed publicly.</strong>
                  </span>
                </li>
              </ul>
            </div>
            {/* PHONE */}

            <div className="border-t-2 border-white/40 pt-5 mb-7">
              <h3 className="font-display font-black text-xl uppercase mb-3">
                Phone Number
              </h3>

              <ul className="space-y-3 text-sm leading-relaxed">
                <li className="flex gap-2">
                  <span>→</span>
                  <span>Optional. You can leave your phone number blank.</span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Used only to help with safe communication when returning an
                    item.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>
                      We do not use your number for promotional calls or
                      messages.
                    </strong>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* ================================================= */}
          {/* RIGHT CARD */}
          {/* ================================================= */}

          <div className="bg-white border-2 border-black brutal-shadow-lg p-8 w-full lg:w-2/5">
            {/* ================================================= */}
            {/* STEP 1 - DETAILS */}
            {/* ================================================= */}

            <>
              <h1 className="font-display font-black text-3xl uppercase mb-2">
                Create Account
              </h1>

              <p className="text-sm mb-6">
                Join the campus lost &amp; found community.
              </p>

              <form onSubmit={submit} className="space-y-4">
                {/* NAME */}

                <div>
                  <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                    Full Name
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
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
                    minLength={6}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="Create a password"
                    className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                    Phone
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="Enter your phone number (optional)"
                    className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div className="bg-[#E63946] text-white border-2 border-black px-3 py-2 text-sm font-semibold">
                    {error}
                  </div>
                )}

                {/* CONTINUE */}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-black text-white border-2 border-black px-4 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60"
                >
                  {busy ? "Creating Account…" : "Continue"}
                </button>

                <div className="flex items-center gap-3 my-4">
                  <div className="h-px bg-black flex-1" />

                  <span className="text-xs font-bold uppercase">OR</span>

                  <div className="h-px bg-black flex-1" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={busy}
                  className="w-full bg-white text-black border-2 border-black px-4 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60 flex items-center justify-center gap-3"
                >
                  <span className="text-lg font-bold">G</span>
                  Continue with Google
                </button>
              </form>

              <p className="mt-6 text-sm">
                Already have an account?{" "}
                <Link to="/login" className="font-bold underline">
                  Log in
                </Link>
              </p>
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
