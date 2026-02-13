"use client";

import { useEffect } from "react";
import {createClient} from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { clearDemoUser } from "@/lib/demo-mode";

export default function SignOutPage() {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    async function signOut() {
      clearDemoUser();
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    }
    signOut();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <p className="text-slate-600 dark:text-slate-300">{t("auth.signOut.loading")}</p>
    </div>
  );
}
