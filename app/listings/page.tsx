"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  serviceName: string;
  totalSlots: number;
  availableSlots: number;
  monthlyPrice: string;
  description: string | null;
  avgRating: number;
  ratingCount: number;
  owner: { email: string };
};

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => (r.ok ? r.json() : []))
      .then(setServices);
  }, []);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      const url = filter
        ? `/api/listings?service=${encodeURIComponent(filter)}`
        : "/api/listings";
      const res = await fetch(url);
      if (res.ok) setListings(await res.json());
      setLoading(false);
    }
    fetchListings();
  }, [filter]);

  if (loading && listings.length === 0) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Browse Listings</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm font-medium text-slate-700">
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="">All services</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl">
          <p className="text-slate-600 mb-4">No listings found</p>
          <Link
            href="/listings/create"
            className="text-primary-600 hover:underline font-medium"
          >
            Create the first listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="block p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-primary-200 transition-all"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                {listing.serviceName}
              </h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-primary-600">
                  ${Number(listing.monthlyPrice).toFixed(2)}
                </span>
                <span className="text-slate-500 text-sm">/month</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  {listing.availableSlots} of {listing.totalSlots} slots available
                </span>
                {listing.ratingCount > 0 && (
                  <span className="flex items-center gap-1">
                    ★ {listing.avgRating.toFixed(1)} ({listing.ratingCount})
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
