import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE_NAME, isDemoEnabled } from "@/lib/demo-mode";

const PROTECTED_ROUTES = ["/dashboard", "/listings/create"];
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isDemo = isDemoEnabled() && request.cookies.get(DEMO_COOKIE_NAME)?.value === "1";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname) && !user && !isDemo) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute(pathname) && (user || isDemo)) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") ?? "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}
