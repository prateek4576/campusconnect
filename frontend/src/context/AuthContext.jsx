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
  // MANUAL REGISTER
  // =====================================================

  async function register(
    name,
    email,
    phone,
    password
  ) {
    const { data } = await api.post(
      "/auth/register",
      {
        name,
        email,
        phone: phone || "",
        password,
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
        register,
        googleLogin,

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