"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { apiFetchJson, ApiError } from "@/lib/api-client";
import { useI18n } from "@/components/i18n-provider";

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
  const { t } = useI18n();
  const [serviceName, setServiceName] = useState("");
  const [totalSlots, setTotalSlots] = useState(4);
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  const trimmedServiceName = serviceName.trim();
  const parsedMonthlyPrice = Number.parseFloat(monthlyPrice);
  const hasMonthlyPrice =
    monthlyPrice.trim().length > 0 && Number.isFinite(parsedMonthlyPrice) && parsedMonthlyPrice >= 0;
  const safeTotalSlots = Number.isFinite(totalSlots) ? Math.min(Math.max(totalSlots, 2), 10) : 2;
  const availableSlots = Math.max(safeTotalSlots - 1, 1);
  const perSlotPrice =
    hasMonthlyPrice && safeTotalSlots > 0 ? parsedMonthlyPrice / safeTotalSlots : null;
  const canSubmit = !loading && trimmedServiceName.length > 0 && hasMonthlyPrice && safeTotalSlots >= 2;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setAuthChecked(true);
      if (!data.user) router.replace("/auth/login?redirectTo=/listings/create");
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetchJson<{ id: string }>("/listings", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          serviceName: trimmedServiceName,
          totalSlots: safeTotalSlots,
          availableSlots,
          monthlyPrice: parsedMonthlyPrice,
          description: description.trim() || undefined,
        }),
      });

      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace("/auth/login?redirectTo=/listings/create");
        return;
      }
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="py-12 px-4 flex justify-center">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">{t("dash.loading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col gap-2 mb-8">
        <Link
          href="/listings"
          className="text-primary-600 hover:underline text-sm font-medium inline-block"
        >
          {t("create.backToListings")}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("create.title")}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {t("create.subtitle")}
            </p>
          </div>
          <Link
            href="/listings"
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-semibold text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-950/50"
          >
            {t("create.cancel")}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                  {error}
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="serviceName"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {t("create.form.serviceName.label")}
                </label>
                <input
                  id="serviceName"
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                  placeholder={t("create.form.serviceName.placeholder")}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-medium text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {POPULAR_SERVICES.map((s) => {
                    const selected = s.toLowerCase() === trimmedServiceName.toLowerCase();
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setServiceName(s)}
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                          selected
                            ? "bg-primary-600 text-white"
                            : "border border-slate-200 bg-white/60 text-slate-700 hover:bg-white dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-200 dark:hover:bg-slate-950/40",
                        ].join(" ")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="totalSlots"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    {t("create.form.totalSlots.label")}
                  </label>
                  <input
                    id="totalSlots"
                    type="number"
                    min={2}
                    max={10}
                    value={totalSlots}
                    onChange={(e) => setTotalSlots(Number.parseInt(e.target.value, 10) || 2)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm font-medium text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {t("create.form.totalSlots.hint", { n: availableSlots })}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="monthlyPrice"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    {t("create.form.monthlyPrice.label")}
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400">
                      $
                    </span>
                    <input
                      id="monthlyPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={monthlyPrice}
                      onChange={(e) => setMonthlyPrice(e.target.value)}
                      required
                      placeholder={t("create.form.monthlyPrice.placeholder")}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white/70 pl-8 pr-4 text-sm font-medium text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                    />
                  </div>
                  {perSlotPrice !== null ? (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {t("create.form.monthlyPrice.perSlot", {
                        price: `$${perSlotPrice.toFixed(2)}`,
                      })}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {t("create.form.monthlyPrice.help")}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  {t("create.form.description.label")}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t("create.form.description.placeholder")}
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("create.form.footerNote")}
                </p>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-primary-600 px-6 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-md disabled:opacity-50"
                >
                  {loading ? t("create.form.submitting") : t("create.form.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("create.preview.title")}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t("create.preview.subtitle")}
              </p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {trimmedServiceName || t("create.preview.serviceFallback")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t("create.preview.slots", {
                        available: availableSlots,
                        total: safeTotalSlots,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-primary-600">
                      {hasMonthlyPrice
                        ? `$${parsedMonthlyPrice.toFixed(2)}`
                        : t("create.preview.priceFallback")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("create.preview.perMonthTotal")}
                    </p>
                  </div>
                </div>
                {description.trim().length > 0 ? (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
                    {description.trim()}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    {t("create.preview.descriptionEmpty")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("create.tips.title")}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li>{t("create.tips.1")}</li>
                <li>{t("create.tips.2")}</li>
                <li>{t("create.tips.3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
