"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { type Language } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-10 w-[84px]" aria-hidden="true" />;

  const options: Array<{ id: Language; label: string }> = [
    { id: "en", label: t("lang.en") },
    { id: "mn", label: t("lang.mn") },
  ];

  return (
    <div className="inline-flex items-center gap-2">
      <span className="sr-only">{t("lang.label")}</span>
      <div className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white/70 p-1 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        {options.map((opt) => {
          const active = opt.id === lang;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setLang(opt.id)}
              className={[
                "h-8 rounded-xl px-3 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]",
                active
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-950/60",
              ].join(" ")}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

