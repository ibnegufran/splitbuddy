import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredToken,
  getMe,
  getStoredToken,
  login as loginApi,
  setStoredToken,
  signup as signupApi
} from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await getMe();
        setUser(me);
      } catch (_error) {
        clearStoredToken();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const signup = async (payload) => {
    const data = await signupApi(payload);
    setStoredToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    const data = await loginApi(payload);
    setStoredToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearStoredToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signup,
      login,
      logout,
      isAuthenticated: Boolean(user)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
