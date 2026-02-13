"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { useI18n } from "@/components/i18n-provider";

function AuthErrorContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An error occurred";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-12 flex items-center justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-r from-primary-500/15 via-sky-500/10 to-fuchsia-500/10 blur-3xl dark:from-primary-400/10 dark:via-sky-400/5 dark:to-fuchsia-400/5"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-8 text-center shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10 2h4l8 8v4l-8 8h-4l-8-8v-4l8-8z" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t("auth.error.title")}
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>
          <div className="mt-8">
            <Link
              href="/auth/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
            >
              {t("auth.error.cta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">{t("auth.loading")}</p>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
