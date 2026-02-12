"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
      const res = await fetch(`/api/listings/${id}`);
      if (res.ok) setListing(await res.json());
      setLoading(false);
    }
    fetchListing();
  }, [id]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  async function handleJoin() {
    setJoinError("");
    setJoining(true);
    try {
      const res = await fetch(`/api/listings/${id}/join`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Failed to join");
        return;
      }
      setListing(data.listing);
      router.refresh();
    } finally {
      setJoining(false);
    }
  }

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setRatingLoading(true);
    try {
      const res = await fetch(`/api/listings/${id}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: rating, comment: comment || undefined }),
      });
      if (res.ok) {
        const updated = await fetch(`/api/listings/${id}`);
        if (updated.ok) setListing(await updated.json());
        setRating(0);
        setComment("");
      }
    } finally {
      setRatingLoading(false);
    }
  }

  if (loading || !listing) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
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

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {listing.serviceName}
            </h1>
            <div className="flex items-center gap-4 text-slate-600 mb-2">
              <span className="text-3xl font-bold text-primary-600">
                ${Number(listing.monthlyPrice).toFixed(2)}
              </span>
              <span>/month total</span>
            </div>
            <p className="text-slate-600 text-sm">
              {listing.availableSlots} of {listing.totalSlots} slots available
            </p>
            <p className="text-slate-500 text-sm mt-1">
              by {listing.owner.email}
            </p>
          </div>
          {canJoin && (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
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

        {listing.ratingCount > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-amber-500">★</span>
            <span className="font-medium">{listing.avgRating.toFixed(1)}</span>
            <span className="text-slate-500 text-sm">
              ({listing.ratingCount} reviews)
            </span>
          </div>
        )}
      </div>

      {listing.members.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-4">Members</h2>
          <ul className="space-y-2">
            <li className="text-slate-600">{listing.owner.email} (owner)</li>
            {listing.members.map((m) => (
              <li key={m.user.email} className="text-slate-600">
                {m.user.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canRate && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-slate-900 mb-4">Rate this listing</h2>
          <form onSubmit={handleRate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Score (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      rating >= s
                        ? "bg-amber-400 text-amber-900"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={ratingLoading || rating < 1}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              Submit rating
            </button>
          </form>
        </div>
      )}

      {listing.ratings.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Reviews</h2>
          <ul className="space-y-4">
            {listing.ratings.map((r) => (
              <li key={r.user.email} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-500">★ {r.score}</span>
                  <span className="text-slate-500 text-sm">{r.user.email}</span>
                </div>
                {r.comment && (
                  <p className="text-slate-600 text-sm">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
