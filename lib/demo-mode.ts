export const DEMO_COOKIE_NAME = "demo";
export const DEMO_USER_EMAIL_KEY = "demo:userEmail";

export function isDemoEnabled() {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_API_BASE_URL
  );
}

export function setDemoCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE_NAME}=1; path=/; max-age=31536000; samesite=lax`;
}

export function clearDemoCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getDemoUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEMO_USER_EMAIL_KEY);
}

export function setDemoUserEmail(email: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_USER_EMAIL_KEY, email);
  setDemoCookie();
}

export function clearDemoUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DEMO_USER_EMAIL_KEY);
  clearDemoCookie();
}

