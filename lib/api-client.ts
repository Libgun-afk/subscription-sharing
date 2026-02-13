"use client";

import { createClient } from "@/lib/supabase/client";
import { isDemoEnabled } from "@/lib/demo-mode";
import { demoApiFetchJson } from "@/lib/demo-api";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return "";
  return base.replace(/\/+$/, "");
}

async function getAccessToken() {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetchJson<T>(
  path: string,
  options?: RequestInit & { auth?: boolean }
): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    if (isDemoEnabled()) {
      return (await demoApiFetchJson<T>(path, options)) as T;
    }
    throw new ApiError("Missing NEXT_PUBLIC_API_BASE_URL", 0, null);
  }
  if (!path.startsWith("/")) {
    throw new ApiError("API path must start with '/'", 0, { path });
  }

  const auth = options?.auth ?? false;
  const token = auth ? await getAccessToken() : null;

  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    const msg =
      typeof body === "object" && body && "error" in body
        ? String((body as any).error)
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}

