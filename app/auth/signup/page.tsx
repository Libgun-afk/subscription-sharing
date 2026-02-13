"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { isDemoEnabled, setDemoUserEmail } from "@/lib/demo-mode";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function SignUpContent() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t("auth.error.emailRequired"));
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError(t("auth.error.emailInvalid"));
      return;
    }
    if (!password || password.length < 6) {
      setError(t("auth.error.passwordLength"));
      return;
    }

    // Demo mode: fake signup and continue.
    if (isDemoEnabled()) {
      setDemoUserEmail(trimmedEmail);
      setSuccess(true);
      router.refresh();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectTo}`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError(t("auth.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] px-4 py-12 flex items-center justify-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-r from-primary-500/15 via-sky-500/10 to-fuchsia-500/10 blur-3xl dark:from-primary-400/10 dark:via-sky-400/5 dark:to-fuchsia-400/5"
        />
        <div className="relative w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-8 text-center shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-700 dark:bg-primary-400/10 dark:text-primary-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                <path d="M4 4h16v16H4z" opacity="0" />
                <path d="M4 8l8 5 8-5" />
                <path d="M4 18h16V8l-8 5-8-5v10z" />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("auth.checkEmail.title")}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {t("auth.checkEmail.subtitle", { email: email.trim() })}
            </p>

            <div className="mt-8">
              <Link
                href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
              >
                {t("auth.checkEmail.cta")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-12 flex items-center justify-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-r from-primary-500/15 via-sky-500/10 to-fuchsia-500/10 blur-3xl dark:from-primary-400/10 dark:via-sky-400/5 dark:to-fuchsia-400/5"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-8 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("auth.signup.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("auth.signup.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                {t("auth.password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                placeholder={t("auth.passwordPlaceholder")}
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t("auth.passwordHint")}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
            >
              {loading ? t("auth.creating") : t("auth.signUp")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            {t("auth.link.haveAccount")}{" "}
            <Link
              href={`/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="font-semibold text-primary-700 hover:underline dark:text-primary-300"
            >
              {t("auth.link.toSignin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400">{t("auth.loading")}</p>
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
