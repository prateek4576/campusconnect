import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import api, { formatApiErrorDetail } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH CURRENT USER
  // =====================================================

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // =====================================================
  // LOGIN
  // =====================================================

  async function login(email, password) {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    if (data.token) {
      localStorage.setItem("cc_token", data.token);
    }

    setUser(data.user);

    return data.user;
  }

  // =====================================================
  // GOOGLE LOGIN / SIGNUP
  // =====================================================

  async function googleLogin(credential) {
    const { data } = await api.post(
      "/auth/google",
      {
        credential,
      }
    );

    if (data.token) {
      localStorage.setItem(
        "cc_token",
        data.token
      );
    }

    setUser(data.user);

    return data.user;
  }

  // =====================================================
  // STEP 1: REQUEST REGISTRATION
  // =====================================================

  async function requestRegistration(payload) {
    const { data } = await api.post(
      "/auth/register/request",
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      }
    );

    return data;
  }

  // =====================================================
  // STEP 2: VERIFY EMAIL
  // =====================================================

  async function verifyEmail(email, otp) {
    const { data } = await api.post(
      "/auth/verify-email",
      {
        email,
        otp,
      }
    );

    return data;
  }

  // =====================================================
  // STEP 3: COMPLETE REGISTRATION
  // =====================================================

  async function completeRegistration(payload) {
    const { data } = await api.post(
      "/auth/register/complete",
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        verification_token:
          payload.verification_token,
      }
    );

    if (data.token) {
      localStorage.setItem(
        "cc_token",
        data.token
      );
    }

    setUser(data.user);

    return data.user;
  }

  // =====================================================
  // RESEND VERIFICATION CODE
  // =====================================================

  async function resendVerification(payload) {
    const { data } = await api.post(
      "/auth/register/resend",
      {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
      }
    );

    return data;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (_e) {}

    localStorage.removeItem("cc_token");

    setUser(false);
  }

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        login,
        googleLogin,

        requestRegistration,
        verifyEmail,
        completeRegistration,
        resendVerification,

        logout,

        refresh: fetchMe,

        formatApiErrorDetail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
