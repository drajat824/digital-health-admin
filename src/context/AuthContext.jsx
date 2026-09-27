import { createContext, useContext, useState, useCallback } from "react";
import { login as loginApi } from "../api/authApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "dh_admin_token";
const USER_KEY = "dh_admin_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = useCallback(async (email, password) => {
    const res = await loginApi({ email, password });
    const { token: newToken, user: newUser } = res.data;

    // Gerbang admin di sisi client: backend belum punya middleware role-check,
    // jadi kita tolak akses di sini jika role bukan 'admin'.
    if (newUser.role !== "admin") {
      throw new Error(
        "Akun ini bukan admin. Hanya akun dengan role 'admin' yang dapat mengakses dashboard ini."
      );
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
