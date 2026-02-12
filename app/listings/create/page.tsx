"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const POPULAR_SERVICES = [
  "Netflix",
  "Spotify",
  "Disney+",
  "YouTube Premium",
  "HBO Max",
  "Amazon Prime",
  "Apple Music",
  "Hulu",
];

export default function CreateListingPage() {
  const [serviceName, setServiceName] = useState("");
  const [totalSlots, setTotalSlots] = useState(4);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setAuthChecked(true);
        if (!d.user) router.replace("/auth/login");
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: serviceName.trim(),
          totalSlots,
          availableSlots: totalSlots - 1,
          monthlyPrice: parseFloat(monthlyPrice),
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create listing");
        return;
      }

      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link
        href="/listings"
        className="text-primary-600 hover:underline text-sm font-medium mb-6 inline-block"
      >
        ← Back to listings
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Service name
          </label>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            required
            placeholder="e.g. Netflix, Spotify"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {POPULAR_SERVICES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setServiceName(s)}
                className="px-2 py-1 text-xs bg-slate-100 rounded hover:bg-slate-200 text-slate-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Total slots
          </label>
          <input
            type="number"
            min={2}
            max={10}
            value={totalSlots}
            onChange={(e) => setTotalSlots(parseInt(e.target.value) || 2)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            You keep 1 slot; {totalSlots - 1} available for others
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Monthly price (total)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(e.target.value)}
              required
              placeholder="15.99"
              className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Any details about payment or sharing..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
