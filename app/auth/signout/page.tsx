"use client";

import { useEffect } from "react";
import {createClient} from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function signOut() {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }
    signOut();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-slate-600">Signing out...</p>
    </div>
  );
}
