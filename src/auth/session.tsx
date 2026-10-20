import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api, clearSession, getGuestToken, hasSession, saveSession } from "../api/http";
import type { Me } from "../api/types";

type SessionValue = {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

async function establish(path: string, body: object): Promise<Me> {
  const tokens = await api<{ access_token: string; refresh_token: string }>(path, {
    method: "POST",
    auth: false,
    body: JSON.stringify(body),
  });
  saveSession(tokens.access_token, tokens.refresh_token);
  return api<Me>("/api/v1/auth/me");
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSession()) {
      setLoading(false);
      return;
    }
    api<Me>("/api/v1/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const me = await establish("/api/v1/auth/login", {
      email,
      password,
      guest_token: getGuestToken(),
    });
    setUser(me);
  }

  async function register(email: string, password: string, fullName: string) {
    const me = await establish("/api/v1/auth/register", { email, password, full_name: fullName });
    setUser(me);
  }

  async function logout() {
    const refresh = localStorage.getItem("mahavir_refresh");
    if (refresh) {
      await api("/api/v1/auth/logout", { method: "POST", auth: false, body: JSON.stringify({ refresh_token: refresh }) }).catch(
        () => undefined,
      );
    }
    clearSession();
    setUser(null);
  }

  return <SessionContext.Provider value={{ user, loading, login, register, logout }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("Session is unavailable");
  }
  return value;
}
