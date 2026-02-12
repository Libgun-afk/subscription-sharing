"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "An error occurred";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-xl font-bold text-slate-900 mb-6">
          Authentication Error
        </h1>
        <p className="text-slate-600 mb-6">{message}</p>
        <Link
          href="/auth/login"
          className="text-primary-600 hover:underline font-medium"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-slate-500">Loading...</p>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
