import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/auth.api";

const STORAGE_KEY = "today_auth_state_v1";

const AuthContext = createContext(null);

function readStorage() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(payload) {
  if (typeof localStorage === "undefined") return;
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStorage());

  const syncAuth = useCallback((next) => {
    setAuth(next);
    writeStorage(next);
  }, []);

  useEffect(() => {
    if (!auth?.accessToken) return;
    let canceled = false;
    authApi
      .fetchProfile(auth.accessToken)
      .then((res) => {
        if (canceled) return;
        syncAuth({ accessToken: auth.accessToken, user: res.user });
      })
      .catch(() => {
        if (canceled) return;
        syncAuth(null);
      });
    return () => {
      canceled = true;
    };
  }, [auth?.accessToken, syncAuth]);

  const login = useCallback(
    async (credentials) => {
      const res = await authApi.login(credentials);
      syncAuth(res);
      return res.user;
    },
    [syncAuth]
  );

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload);
      syncAuth(res);
      return res.user;
    },
    [syncAuth]
  );

  const logout = useCallback(() => {
    syncAuth(null);
  }, [syncAuth]);

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      accessToken: auth?.accessToken ?? null,
      login,
      register,
      logout,
      isReady: true,
    }),
    [auth, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용 가능합니다.");
  }
  return ctx;
}
