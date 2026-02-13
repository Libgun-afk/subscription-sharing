"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SubscriptionCard,
  SubscriptionCardSkeleton,
} from "@/components/subscription-card";
import { useI18n } from "@/components/i18n-provider";
import { apiFetchJson, ApiError } from "@/lib/api-client";

type Listing = {
  id: string;
  serviceName: string;
  totalSlots: number;
  availableSlots: number;
  monthlyPrice: number;
  pricePerSlot?: number | null;
  owner?: { email?: string | null } | null;
  avgRating?: number | null;
};

export default function ListingsPage() {
  const { t } = useI18n();
  const [listings, setListings] = useState<Listing[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiFetchJson<string[]>("/services")
      .then((data) => {
        if (!mounted) return;
        setServices(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Non-fatal: filtering can still work with free-form input.
        if (!mounted) return;
        setServices([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      setError(null);
      setListings([]);
      try {
        const path = filter
          ? `/listings?service=${encodeURIComponent(filter)}`
          : "/listings";
        const data = await apiFetchJson<Listing[]>(path);
        setListings(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        if (e instanceof ApiError) setError(e.message);
        else setError(e instanceof Error ? e.message : "Failed to fetch listings");
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [filter]);

  async function joinListing(listingId: string) {
    setJoiningId(listingId);
    setError(null);
    try {
      const body = await apiFetchJson<{ listing?: Listing }>(`/listings/${listingId}/join`, {
        method: "POST",
        auth: true,
      });
      if (body?.listing?.id) {
        setListings((prev) =>
          prev.map((l) => (l.id === body.listing!.id ? body.listing! : l))
        );
      }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        setError(t("listings.error.signIn"));
      } else if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to join subscription");
      }
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t("listings.title")}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {t("listings.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="filter"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {t("listings.service")}
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-medium text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
          >
            <option value="">{t("listings.allServices")}</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <Link
            href="/listings/create"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary-600 px-5 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
          >
            {t("listings.create")}
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{error}</span>
            {error.toLowerCase().includes("sign in") ? (
              <Link
                href="/auth/login"
                className="font-semibold text-rose-900 hover:underline dark:text-rose-100"
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SubscriptionCardSkeleton key={i} />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/70 to-white/40 p-10 text-center shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/35 dark:to-slate-950/15">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("listings.empty.title")}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {filter ? t("listings.empty.subtitle.filtered") : t("listings.empty.subtitle.all")}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/listings/create"
              className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
            >
              {t("listings.create")}
            </Link>
            <button
              type="button"
              onClick={() => setFilter("")}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-950/50"
            >
              {t("listings.empty.clear")}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <SubscriptionCard
              key={listing.id}
              serviceName={listing.serviceName}
              price={
                typeof listing.pricePerSlot === "number" && Number.isFinite(listing.pricePerSlot)
                  ? listing.pricePerSlot
                  : listing.totalSlots > 0
                    ? listing.monthlyPrice / listing.totalSlots
                    : listing.monthlyPrice
              }
              totalSlots={listing.totalSlots}
              availableSlots={listing.availableSlots}
              ownerName={listing.owner?.email ?? "Unknown"}
              rating={typeof listing.avgRating === "number" ? listing.avgRating : null}
              joining={joiningId === listing.id}
              onJoin={() => joinListing(listing.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
