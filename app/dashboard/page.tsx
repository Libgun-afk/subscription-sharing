"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  serviceName: string;
  totalSlots: number;
  availableSlots: number;
  monthlyPrice: string;
  members: { user: { email: string } }[];
};

export default function DashboardPage() {
  const [owned, setOwned] = useState<Listing[]>([]);
  const [memberOf, setMemberOf] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) return;
      const auth = await authRes.json();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      setUser(auth.user);

      const listingsRes = await fetch("/api/user/listings");
      if (!listingsRes.ok) {
        setLoading(false);
        return;
      }
      const { owned: o, memberOf: m } = await listingsRes.json();
      setOwned(o);
      setMemberOf(m);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Dashboard</h1>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Your listings
        </h2>
        {owned.length === 0 ? (
          <><p className="text-slate-600 mb-4">You haven&apos;t created any listings</p><Link
            href="/listings/create"
            className="text-primary-600 hover:underline font-medium"
          >
            Create a listing
          </Link></>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {owned.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="block p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-slate-900">{l.serviceName}</h3>
                <p className="text-sm text-slate-600">
                  ${Number(l.monthlyPrice).toFixed(2)}/mo · {l.availableSlots}{" "}
                  slots left
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Joined subscriptions
        </h2>
        {memberOf.length === 0 ? (
          <p className="text-slate-600">
            You haven&apos;t joined any subscriptions yet.{" "}
            <Link href="/listings" className="text-primary-600 hover:underline">
              Browse listings
            </Link>
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberOf.map((l) => (
              <Link
                key={l.id}
                href={`/listings/${l.id}`}
                className="block p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-slate-900">{l.serviceName}</h3>
                <p className="text-sm text-slate-600">
                  ${Number(l.monthlyPrice).toFixed(2)}/mo · {l.members.length + 1}{" "}
                  members
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
