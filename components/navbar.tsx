"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from "@/components/providers";

export function Navbar() {
  const { user, refreshAuth } = useAuth();

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return (
    <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            ShareSub . 
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/listings"
              className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Browse
            </Link>
            {user ? (
              <>
                <Link
                  href="/listings/create"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Create Listing
                </Link>
                <Link
                  href="/dashboard"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-slate-500 text-sm hidden sm:inline">
                  {user.email}
                </span>
                <Link
                  href="/auth/signout"
                  className="text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
