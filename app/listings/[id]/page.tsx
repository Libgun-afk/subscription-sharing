"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetchJson, ApiError } from "@/lib/api-client";
import { StarRating } from "@/components/star-rating";

type Listing = {
  id: string;
  serviceName: string;
  totalSlots: number;
  availableSlots: number;
  monthlyPrice: number | string;
  description: string | null;
  avgRating: number;
  ratingCount: number;
  owner: { email: string };
  members: { user: { email: string } }[];
  ratings: { score: number; comment: string | null; user: { email: string } }[];
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      try {
        const data = await apiFetchJson<Listing>(`/listings/${id}`);
        setListing(data);
      } catch {
        // keep null
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user?.email ? { email: data.user.email } : null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleJoin() {
    setJoinError("");
    setJoining(true);
    try {
      const data = await apiFetchJson<{ listing: Listing }>(`/listings/${id}/join`, {
        method: "POST",
        auth: true,
      });
      setListing(data.listing);
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace(`/auth/login?redirectTo=${encodeURIComponent(`/listings/${id}`)}`);
        return;
      }
      setJoinError(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setJoining(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setRatingLoading(true);
    try {
      await apiFetchJson(`/listings/${id}/ratings`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ score: rating, comment: comment || undefined }),
      });
      const updated = await apiFetchJson<Listing>(`/listings/${id}`);
      setListing(updated);
      setRating(0);
      setComment("");
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace(`/auth/login?redirectTo=${encodeURIComponent(`/listings/${id}`)}`);
      }
    } finally {
      setRatingLoading(false);
    }
  }

  if (loading || !listing) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  const isOwner = user && listing.owner.email === user.email;
  const isMember = listing.members.some((m) => m.user.email === user?.email);
  const canJoin = user && !isOwner && !isMember && listing.availableSlots > 0;
  const canRate = user && (isOwner || isMember);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/listings"
        className="text-primary-600 hover:underline text-sm font-medium mb-6 inline-block"
      >
        ← Back to listings
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 mb-8 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              {listing.serviceName}
            </h1>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 mb-2">
              <span className="text-3xl font-semibold text-primary-600">
                ${Number(listing.monthlyPrice).toFixed(2)}
              </span>
              <span className="text-sm">/month total</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              {listing.availableSlots} of {listing.totalSlots} slots available
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              by {listing.owner.email}
            </p>
          </div>
          {canJoin && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join"}
            </button>
          )}
        </div>

        {joinError && (
          <p className="mt-4 text-red-600 text-sm">{joinError}</p>
        )}

        {listing.description && (
          <p className="mt-4 text-slate-600">{listing.description}</p>
        )}

        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StarRating value={listing.avgRating} readOnly ariaLabel="Average rating" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {listing.ratingCount > 0
                ? `${listing.avgRating.toFixed(1)} (${listing.ratingCount})`
                : "No reviews yet"}
            </span>
          </div>
        </div>
      </div>

      {listing.members.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 mb-8 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Members</h2>
          <ul className="space-y-2">
            <li className="text-slate-600 dark:text-slate-300">{listing.owner.email} (owner)</li>
            {listing.members.map((m) => (
              <li key={m.user.email} className="text-slate-600 dark:text-slate-300">
                {m.user.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canRate && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 mb-8 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Rate this listing</h2>
          <form onSubmit={handleRate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Rating
              </label>
              <StarRating value={rating} onChange={setRating} ariaLabel="Select rating" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              disabled={ratingLoading || rating < 1}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md disabled:opacity-50"
            >
              Submit rating
            </button>
          </form>
        </div>
      )}

      {listing.ratings.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Reviews</h2>
          <ul className="space-y-4">
            {listing.ratings.map((r) => (
              <li
                key={r.user.email}
                className="border-b border-slate-100 pb-4 last:border-0 dark:border-slate-900/60"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-500">★ {r.score}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm">{r.user.email}</span>
                </div>
                {r.comment && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
