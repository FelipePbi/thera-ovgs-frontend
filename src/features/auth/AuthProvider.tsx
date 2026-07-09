"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import type { User } from "@/lib/types";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/features/auth/storage";
import { useAppDispatch } from "@/store/hooks";
import { resetDraft } from "@/store/draftOrderSlice";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    authApi
      .me()
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.login(username, password);
      queryClient.clear();
      setStoredToken(result.token);
      setToken(result.token);
      setUser(result.user);
    },
    [queryClient],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    queryClient.clear();
    dispatch(resetDraft());
  }, [dispatch, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
