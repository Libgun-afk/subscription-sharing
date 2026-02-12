"use client";

import { useState } from "react";
import { createContext, useContext, useCallback } from "react";

type AuthContextType = {
  user: { email: string } | null;
  setUser: (user: { email: string } | null) => void;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user ? { email: data.user.email } : null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
}
