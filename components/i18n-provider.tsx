"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type Language, getDefaultLanguage, translate } from "@/lib/i18n";

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

function applyLangToDocument(lang: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.cookie = `lang=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const initial = getDefaultLanguage();
    setLangState(initial);
    applyLangToDocument(initial);
  }, []);

  function setLang(lang: Language) {
    setLangState(lang);
    localStorage.setItem("lang", lang);
    applyLangToDocument(lang);
  }

  const value = useMemo<I18nContextType>(() => {
    return {
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

