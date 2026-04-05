import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, PERMISSIONS } from "../data/store";
import { saveToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("finvault_token"));
  const [loading, setLoading] = useState(Boolean(authToken));
  const [error, setError] = useState(null);

  const handleToken = useCallback(async (token) => {
    saveToken(token);
    setAuthToken(token);
    const profile = await api.getCurrentUser();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const profile = await api.getCurrentUser();
        if (!cancelled) setUser(profile);
      } catch (err) {
        if (!cancelled) {
          setUser(null);
          setError(err.message || "Failed to load profile");
          saveToken(null);
          setAuthToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [authToken]);

    const login = useCallback(async (email, password) => {
      setLoading(true); setError(null);
      try {
        const data = await api.login(email, password);
        return await handleToken(data.access_token);
      } catch (e) {
        setError(getApiErrorMessage(e, "Login failed"));
        throw e;
      } finally {
        setLoading(false);
      }
    }, [handleToken]);

  const requestOtp = useCallback(async (email, role) => {
    setError(null);
    return api.requestOtp(email, role);
  }, []);

  const verifyOtp = useCallback(async (email, otp, role) => {
    setLoading(true); setError(null);
    try {
      const data = await api.verifyOtp(email, otp, role);
      return await handleToken(data.access_token);
      } catch (e) {
        setError(getApiErrorMessage(e, "OTP verification failed"));
        throw e;
      } finally {
        setLoading(false);
    }
  }, [handleToken]);

  const logout = useCallback(() => {
    saveToken(null);
    setAuthToken(null);
    setUser(null);
  }, []);

  const can = useCallback((action) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(action) ?? false;
  }, [user]);

  const getApiErrorMessage = (error, fallback = "Something went wrong") => {
    const detail = error?.response?.data?.detail;
    if (detail) return detail;
    if (error?.response?.status === 401) return "User not found";
    return error?.message || fallback;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, requestOtp, verifyOtp, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
