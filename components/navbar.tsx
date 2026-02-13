"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/components/providers";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/components/i18n-provider";

export function Navbar() {
  const { user, refreshAuth } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-slate-900 hover:text-slate-700 transition-colors dark:text-slate-100 dark:hover:text-slate-200"
          >
            <span className="text-primary-600 dark:text-primary-400">Share</span>
            <span>Sub</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/listings"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors dark:text-slate-300 dark:hover:text-slate-100"
            >
              {t("nav.browse")}
            </Link>
            {user ? (
              <>
                <Link
                  href="/listings/create"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors dark:text-slate-300 dark:hover:text-slate-100"
                >
                  {t("nav.createListing")}
                </Link>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors dark:text-slate-300 dark:hover:text-slate-100"
                >
                  {t("nav.dashboard")}
                </Link>
                <span className="text-slate-500 text-sm hidden sm:inline dark:text-slate-400">
                  {user.email}
                </span>
                <Link
                  href="/auth/signout"
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium dark:text-slate-300 dark:hover:text-slate-100"
                >
                  {t("nav.signOut")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors dark:text-slate-300 dark:hover:text-slate-100"
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
                >
                  {t("nav.signUp")}
                </Link>
              </>
            )}

            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
