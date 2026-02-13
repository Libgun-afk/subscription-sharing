"use client";

import { ApiError } from "@/lib/api-client";
import { DEMO_USER_EMAIL_KEY } from "@/lib/demo-mode";

type DemoMember = { user: { email: string } };
type DemoRating = { score: number; comment: string | null; user: { email: string } };

export type DemoListing = {
  id: string;
  serviceName: string;
  totalSlots: number;
  availableSlots: number;
  monthlyPrice: number;
  pricePerSlot: number;
  description: string | null;
  owner: { email: string };
  members: DemoMember[];
  ratings: DemoRating[];
  avgRating: number;
  ratingCount: number;
};

const KEY = "demo:listings:v1";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function readAll(): DemoListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as DemoListing[];
    return Array.isArray(parsed) ? parsed : seed();
  } catch {
    return seed();
  }
}

function writeAll(listings: DemoListing[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(listings));
}

function getUserEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEMO_USER_EMAIL_KEY);
}

function requireDemoAuth() {
  const email = getUserEmail();
  if (!email) throw new ApiError("Unauthorized", 401, { error: "Unauthorized" });
  return email;
}

function recompute(listing: DemoListing): DemoListing {
  const ratingCount = listing.ratings.length;
  const avgRating =
    ratingCount === 0
      ? 0
      : listing.ratings.reduce((s, r) => s + r.score, 0) / ratingCount;
  return { ...listing, ratingCount, avgRating };
}

function seed(): DemoListing[] {
  const listings: DemoListing[] = [
    {
      id: uid(),
      serviceName: "Netflix",
      totalSlots: 4,
      availableSlots: 2,
      monthlyPrice: 15.99,
      pricePerSlot: 15.99 / 4,
      description: "4K plan. Monthly split. Fast payments.",
      owner: { email: "host@demo.com" },
      members: [{ user: { email: "member@demo.com" } }],
      ratings: [{ score: 5, comment: "Smooth setup", user: { email: "member@demo.com" } }],
      avgRating: 5,
      ratingCount: 1,
    },
    {
      id: uid(),
      serviceName: "Spotify",
      totalSlots: 6,
      availableSlots: 3,
      monthlyPrice: 16.99,
      pricePerSlot: 16.99 / 6,
      description: "Family plan seats available.",
      owner: { email: "music@demo.com" },
      members: [{ user: { email: "a@demo.com" } }, { user: { email: "b@demo.com" } }],
      ratings: [],
      avgRating: 0,
      ratingCount: 0,
    },
  ].map(recompute);

  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(listings));
  }
  return listings;
}

export async function demoApiFetchJson<T>(path: string, options?: RequestInit & { auth?: boolean }) {
  const method = (options?.method ?? "GET").toUpperCase();
  const url = new URL(`https://demo.local${path}`);
  const service = url.searchParams.get("service");

  // Services
  if (method === "GET" && url.pathname === "/services") {
    const listings = readAll();
    const names = Array.from(new Set(listings.map((l) => l.serviceName))).sort();
    return names as T;
  }

  // Listings list
  if (method === "GET" && url.pathname === "/listings") {
    const listings = readAll().filter((l) => l.availableSlots > 0);
    const filtered = service ? listings.filter((l) => l.serviceName === service) : listings;
    return filtered.map(recompute) as T;
  }

  // Create listing
  if (method === "POST" && url.pathname === "/listings") {
    if (options?.auth) requireDemoAuth();
    const body = options?.body ? JSON.parse(String(options.body)) : {};
    const serviceName = String(body.serviceName ?? "").trim();
    const totalSlots = Number(body.totalSlots);
    const availableSlots = Number(body.availableSlots ?? totalSlots);
    const monthlyPrice = Number(body.monthlyPrice);
    const description = body.description ? String(body.description) : null;

    if (!serviceName || !Number.isFinite(totalSlots) || !Number.isFinite(monthlyPrice)) {
      throw new ApiError("Missing required fields", 400, { error: "Missing required fields" });
    }

    const ownerEmail = getUserEmail() ?? "host@demo.com";
    const listing: DemoListing = recompute({
      id: uid(),
      serviceName,
      totalSlots,
      availableSlots,
      monthlyPrice,
      pricePerSlot: monthlyPrice / totalSlots,
      description,
      owner: { email: ownerEmail },
      members: [],
      ratings: [],
      avgRating: 0,
      ratingCount: 0,
    });

    const all = readAll();
    all.unshift(listing);
    writeAll(all);
    return listing as T;
  }

  // User listings
  if (method === "GET" && url.pathname === "/user/listings") {
    if (options?.auth) requireDemoAuth();
    const email = getUserEmail() ?? "";
    const all = readAll().map(recompute);
    const owned = all.filter((l) => l.owner.email === email);
    const memberOf = all.filter((l) => l.members.some((m) => m.user.email === email));
    return { owned, memberOf } as T;
  }

  // Listing detail
  const listingMatch = url.pathname.match(/^\/listings\/([^/]+)$/);
  if (method === "GET" && listingMatch) {
    const id = listingMatch[1];
    const listing = readAll().find((l) => l.id === id);
    if (!listing) throw new ApiError("Not found", 404, { error: "Not found" });
    return recompute(listing) as T;
  }

  // Join listing
  const joinMatch = url.pathname.match(/^\/listings\/([^/]+)\/join$/);
  if (method === "POST" && joinMatch) {
    if (options?.auth) requireDemoAuth();
    const email = getUserEmail() ?? "";
    const id = joinMatch[1];
    const all = readAll();
    const idx = all.findIndex((l) => l.id === id);
    if (idx < 0) throw new ApiError("Not found", 404, { error: "Not found" });
    const listing = all[idx];

    if (listing.owner.email === email) {
      throw new ApiError("Cannot join your own listing", 400, { error: "Cannot join your own listing" });
    }
    if (listing.members.some((m) => m.user.email === email)) {
      throw new ApiError("Already a member", 400, { error: "Already a member" });
    }
    if (listing.availableSlots < 1) {
      throw new ApiError("No available slots", 400, { error: "No available slots" });
    }

    const updated: DemoListing = recompute({
      ...listing,
      availableSlots: listing.availableSlots - 1,
      members: [...listing.members, { user: { email } }],
    });
    all[idx] = updated;
    writeAll(all);
    return { listing: updated } as T;
  }

  // Rate listing
  const rateMatch = url.pathname.match(/^\/listings\/([^/]+)\/ratings$/);
  if (method === "POST" && rateMatch) {
    if (options?.auth) requireDemoAuth();
    const email = getUserEmail() ?? "";
    const id = rateMatch[1];
    const all = readAll();
    const idx = all.findIndex((l) => l.id === id);
    if (idx < 0) throw new ApiError("Not found", 404, { error: "Not found" });
    const listing = all[idx];

    const isOwner = listing.owner.email === email;
    const isMember = listing.members.some((m) => m.user.email === email);
    if (!isOwner && !isMember) {
      throw new ApiError("Forbidden", 403, { error: "Forbidden" });
    }

    const body = options?.body ? JSON.parse(String(options.body)) : {};
    const score = Number(body.score);
    const comment = body.comment ? String(body.comment) : null;
    if (!Number.isFinite(score) || score < 1 || score > 5) {
      throw new ApiError("Invalid score", 400, { error: "Invalid score" });
    }

    const ratings = listing.ratings.filter((r) => r.user.email !== email);
    ratings.unshift({ score, comment, user: { email } });
    const updated = recompute({ ...listing, ratings });
    all[idx] = updated;
    writeAll(all);
    return { ok: true } as T;
  }

  throw new ApiError("Not implemented (demo)", 404, { error: "Not implemented" });
}

