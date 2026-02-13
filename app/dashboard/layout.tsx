import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { DEMO_COOKIE_NAME, isDemoEnabled } from "@/lib/demo-mode";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isDemo = isDemoEnabled() && cookieStore.get(DEMO_COOKIE_NAME)?.value === "1";
  if (isDemo) return <>{children}</>;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  return <>{children}</>;
}
