"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";
import { apiFetchJson, ApiError } from "@/lib/api-client";

type Listing = {
  id: string;
  serviceName: string;
  totalSlots: number;
  availableSlots: number;
  monthlyPrice: number | string;
  description?: string | null;
  owner?: { email?: string | null } | null;
  members: { user: { email: string } }[];
};

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

type TabKey = "joined" | "created" | "create";

function toNumber(val: unknown) {
  const n = typeof val === "number" ? val : typeof val === "string" ? Number(val) : NaN;
  return Number.isFinite(n) ? n : 0;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [owned, setOwned] = useState<Listing[]>([]);
  const [memberOf, setMemberOf] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("joined");
  const router = useRouter();

  // Create form state
  const [serviceName, setServiceName] = useState("");
  const [totalSlots, setTotalSlots] = useState(4);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetchJson<{ owned: Listing[]; memberOf: Listing[] }>(
          "/user/listings",
          { auth: true }
        );
        setOwned(Array.isArray(data?.owned) ? data.owned : []);
        setMemberOf(Array.isArray(data?.memberOf) ? data.memberOf : []);
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 401) {
          router.replace("/auth/login?redirectTo=/dashboard");
          return;
        }
        if (e instanceof ApiError) setError(e.message);
        else setError(e instanceof Error ? e.message : t("dash.error.generic"));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setError(null);

    const name = serviceName.trim();
    const price = Number(monthlyPrice);
    const slots = Number(totalSlots);

    if (!name) {
      setFormError(t("dash.form.error.serviceRequired"));
      return;
    }
    if (!Number.isInteger(slots) || slots < 2 || slots > 10) {
      setFormError(t("dash.form.error.slotsRange"));
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError(t("dash.form.error.pricePositive"));
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiFetchJson<Listing>("/listings", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          serviceName: name,
          totalSlots: slots,
          availableSlots: slots - 1,
          monthlyPrice: price,
          description: description.trim() || undefined,
        }),
      });
      setOwned((prev) => [created, ...prev]);
      setServiceName("");
      setTotalSlots(4);
      setMonthlyPrice("");
      setDescription("");
      setTab("created");
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/auth/login?redirectTo=/dashboard");
        return;
      }
      if (e instanceof ApiError) setFormError(e.message);
      else setFormError(e instanceof Error ? e.message : t("dash.form.error.createFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">{t("dash.loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t("dash.title")}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {t("dash.subtitle")}
          </p>
        </div>
        <Link
          href="/listings"
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-5 text-sm font-semibold text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-950/50"
        >
          {t("dash.browse")}
        </Link>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="-mb-px flex gap-2 overflow-x-auto">
          {[
            { key: "joined" as const, label: t("dash.tab.joined") },
            { key: "created" as const, label: t("dash.tab.created") },
            { key: "create" as const, label: t("dash.tab.create") },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={[
                  "whitespace-nowrap rounded-t-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                  active
                    ? "border-b-2 border-primary-600 text-slate-900 dark:text-slate-100"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                ].join(" ")}
                aria-selected={active}
                role="tab"
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-6">
        {tab === "joined" ? (
          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              {memberOf.length === 0 ? (
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-b from-white/70 to-white/40 p-10 text-center shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/35 dark:to-slate-950/15">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t("dash.joined.empty.title")}
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {t("dash.joined.empty.subtitle")}
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/listings"
                      className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
                    >
                      {t("dash.joined.empty.cta")}
                    </Link>
                  </div>
                </div>
              ) : (
                memberOf.map((l) => (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                          {l.serviceName}
                        </div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {t("card.host", { name: l.owner?.email ?? "Unknown" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ${toNumber(l.monthlyPrice).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("card.perMonth")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>{l.members.length + 1} members</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {l.availableSlots} / {l.totalSlots} available
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        ) : tab === "created" ? (
          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              {owned.length === 0 ? (
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-b from-white/70 to-white/40 p-10 text-center shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/35 dark:to-slate-950/15">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {t("dash.created.empty.title")}
                  </h2>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {t("dash.created.empty.subtitle")}
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setTab("create")}
                      className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md"
                    >
                      {t("dash.created.empty.cta")}
                    </button>
                  </div>
                </div>
              ) : (
                owned.map((l) => (
                  <Link
                    key={l.id}
                    href={`/listings/${l.id}`}
                    className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                          {l.serviceName}
                        </div>
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {l.availableSlots} / {l.totalSlots} slots available
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          ${toNumber(l.monthlyPrice).toFixed(2)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {t("card.perMonth")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                      {l.members.length} active members
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {t("dash.create.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t("dash.create.subtitle")}
              </p>

              <form onSubmit={handleCreateListing} className="mt-6 space-y-4">
                {formError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                    {formError}
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("dash.form.service")}
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    required
                    placeholder="e.g. Netflix"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {POPULAR_SERVICES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServiceName(s)}
                        className="rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-950/50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("dash.form.totalSlots")}
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={totalSlots}
                      onChange={(e) => setTotalSlots(Number.parseInt(e.target.value, 10) || 2)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t("dash.form.seatHint", { n: Math.max(0, totalSlots - 1) })}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("dash.form.monthlyPrice")}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
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
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 pl-8 pr-4 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {t("dash.form.perSeatHint", {
                          price: `$${(toNumber(monthlyPrice) / Math.max(1, totalSlots)).toFixed(2)}`,
                        })}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("dash.form.description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Any details about payment or sharing..."
                    className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
                >
                  {submitting ? t("dash.form.submitting") : t("dash.form.submit")}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-gradient-to-b from-white/70 to-white/40 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/35 dark:to-slate-950/15">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t("dash.tips.title")}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>{t("dash.tips.1")}</li>
                <li>{t("dash.tips.2")}</li>
                <li>{t("dash.tips.3")}</li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
