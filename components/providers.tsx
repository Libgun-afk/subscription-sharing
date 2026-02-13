"use client";

import { useState } from "react";
import { createContext, useContext, useCallback } from "react";
import { I18nProvider } from "@/components/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { getDemoUserEmail, isDemoEnabled } from "@/lib/demo-mode";

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
      if (isDemoEnabled()) {
        const demoEmail = getDemoUserEmail();
        if (demoEmail) {
          setUser({ email: demoEmail });
          return;
        }
      }
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user?.email ? { email: data.user.email } : null);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <I18nProvider>
      <AuthContext.Provider value={{ user, setUser, refreshAuth }}>
        {children}
      </AuthContext.Provider>
    </I18nProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
}
