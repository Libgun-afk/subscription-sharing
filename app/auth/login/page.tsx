"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { isDemoEnabled, setDemoUserEmail } from "@/lib/demo-mode";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function LoginForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/listings";

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
    if (!password) {
      setError(t("auth.error.passwordRequired"));
      return;
    }

    // Demo mode: allow "login" without a real backend connection.
    if (isDemoEnabled()) {
      setDemoUserEmail(trimmedEmail);
      router.push(redirectTo);
      router.refresh();
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError(t("auth.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
            autoComplete="current-password"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
        >
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        {t("auth.link.noAccount")}{" "}
        <Link
          href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="font-semibold text-primary-700 hover:underline dark:text-primary-300"
        >
          {t("auth.link.toSignup")}
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
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
              {t("auth.login.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t("auth.login.subtitle")}
            </p>
          </div>

          <Suspense
            fallback={
              <div className="animate-pulse text-sm text-slate-500 dark:text-slate-400">
                {t("auth.loading")}
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
