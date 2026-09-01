import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Signup() {
  const {
    requestRegistration,
    verifyEmail,
    completeRegistration,
    resendVerification,
    googleLogin,
    formatApiErrorDetail,
  } = useAuth();

  const nav = useNavigate();
  const googleButtonRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [step, setStep] = useState("details");

  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const set = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (step !== "details") {
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,

        callback: async (response) => {
          setError("");
          setBusy(true);

          try {
            await googleLogin(response.credential);

            nav("/dashboard");
          } catch (e) {
            setError(
              formatApiErrorDetail(e.response?.data?.detail) ||
                "Google signup failed",
            );
          } finally {
            setBusy(false);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular",
      });
    };

    if (window.google) {
      renderGoogleButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);

          renderGoogleButton();
        }
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  }, [step, googleLogin, nav, formatApiErrorDetail]);

  const handleGoogleLogin = () => {
    if (!window.google) {
      setError("Google Sign-In is not available. Please try again.");
      return;
    }

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
              e.message ||
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
  // START EMAIL VERIFICATION
  // =====================================================

  const requestVerification = async () => {
    setError("");
    setBusy(true);

    try {
      await requestRegistration({
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      setOtp("");
      setStep("verify");
    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) ||
          e.message ||
          "Could not send verification code",
      );
    } finally {
      setBusy(false);
    }
  };

  // =====================================================
  // VERIFY EMAIL
  // =====================================================

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      const data = await verifyEmail(form.email, otp);

      setVerificationToken(data.verification_token);

      // Show success screen
      setStep("success");

      // Move to password screen after 2 seconds
      setTimeout(() => {
        setStep("password");
        setOtp("");
      }, 2000);
    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) ||
          e.message ||
          "Invalid verification code",
      );
    } finally {
      setBusy(false);
    }
  };

  // =====================================================
  // RESEND CODE
  // =====================================================

  const handleResend = async () => {
    setError("");
    setResending(true);

    try {
      await resendVerification({
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      setOtp("");
    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) ||
          e.message ||
          "Could not resend verification code",
      );
    } finally {
      setResending(false);
    }
  };

  // =====================================================
  // FINAL SIGNUP
  // =====================================================

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setBusy(true);

    try {
      await completeRegistration({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        verification_token: verificationToken,
      });

      nav("/dashboard");
    } catch (e) {
      setError(
        formatApiErrorDetail(e.response?.data?.detail) ||
          e.message ||
          "Signup failed",
      );
    } finally {
      setBusy(false);
    }
  };

  // =====================================================
  // MASK EMAIL
  // =====================================================

  const maskedEmail = form.email
    ? form.email.replace(/^(.)(.*)(@.*)$/, "$1********$3")
    : "";

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
                    Used to notify you about relevant lost or found items.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    Used to notify you when someone sends you a message.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>No promotional emails.</strong>
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    <strong>No advertisements or spam.</strong>
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
                  <span>
                    Used only to help with safe communication when returning an
                    item.
                  </span>
                </li>

                <li className="flex gap-2">
                  <span>→</span>
                  <span>
                    We do not use your number for promotional calls or messages.
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

            {step === "details" && (
              <>
                <h1 className="font-display font-black text-3xl uppercase mb-2">
                  Create Account
                </h1>

                <p className="text-sm mb-6">
                  Join the campus lost &amp; found community.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    requestVerification();
                  }}
                  className="space-y-4"
                >
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
                    {emailVerified && (
                      <p className="text-[#2A9D8F] font-bold text-sm mt-2">
                        ✓ Email verified
                      </p>
                    )}
                  </div>

                  {/* PHONE */}

                  <div>
                    <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                      Phone
                    </label>

                    <input
                      required
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="Enter your phone number"
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
                    {busy ? "Sending Code…" : "Continue"}
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
            )}

            {/* ================================================= */}
            {/* STEP 2 - VERIFY EMAIL */}
            {/* ================================================= */}

            {step === "verify" && (
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                <h1 className="font-display font-black text-3xl uppercase mb-2">
                  Verify Your Email
                </h1>

                <p className="text-sm">We sent a verification code to</p>

                <p className="font-bold mb-6">{maskedEmail}</p>

                <div>
                  <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                    Verification Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="------"
                    className="w-full border-2 border-black bg-white px-3 py-3 brutal-shadow-sm text-center text-2xl tracking-[0.4em] font-bold"
                  />
                </div>

                {error && (
                  <div className="bg-[#E63946] text-white border-2 border-black px-3 py-2 text-sm font-semibold">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy || otp.length !== 6}
                  className="w-full bg-black text-white border-2 border-black px-4 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60"
                >
                  {busy ? "Verifying…" : "Verify Email"}
                </button>

                <p className="text-sm text-center pt-2">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="font-bold underline disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend Code"}
                  </button>
                </p>
              </form>
            )}

            {/* ================================================= */}
            {/* STEP 3 - SUCCESS */}
            {/* ================================================= */}

            {step === "success" && (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 bg-[#2A9D8F] text-white border-2 border-black flex items-center justify-center text-3xl font-black mb-5">
                  ✓
                </div>

                <h1 className="font-display font-black text-3xl uppercase mb-3">
                  Email Verified
                </h1>

                <p className="text-sm">
                  Your email has been successfully verified.
                </p>
              </div>
            )}

            {/* ================================================= */}
            {/* STEP 4 - PASSWORD */}
            {/* ================================================= */}

            {step === "password" && (
              <>
                <h1 className="font-display font-black text-3xl uppercase mb-2">
                  Create Password
                </h1>

                <p className="text-sm mb-6">
                  Your email has been verified. Now create your password.
                </p>

                {/* VERIFIED EMAIL */}

                <div className="border-2 border-[#2A9D8F] bg-[#E8F7F3] px-3 py-2 mb-5 text-sm font-bold">
                  ✓ Email verified: {form.email}
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {/* PASSWORD */}

                  <div>
                    <label className="block font-bold uppercase text-xs mb-1 tracking-widest">
                      Create Password
                    </label>

                    <input
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      className="w-full border-2 border-black bg-white px-3 py-2 brutal-shadow-sm"
                    />
                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="bg-[#E63946] text-white border-2 border-black px-3 py-2 text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  {/* SIGN UP */}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-black text-white border-2 border-black px-4 py-3 brutal-shadow brutal-press font-bold uppercase disabled:opacity-60"
                  >
                    {busy ? "Creating…" : "Sign Up"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
