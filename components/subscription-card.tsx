"use client";

import { useI18n } from "@/components/i18n-provider";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function SubscriptionCard({
  serviceName,
  price,
  totalSlots,
  availableSlots,
  ownerName,
  rating,
  joining = false,
  onJoin,
}: {
  serviceName: string;
  price: number;
  totalSlots: number;
  availableSlots: number;
  ownerName: string;
  rating: number | null;
  joining?: boolean;
  onJoin?: () => void | Promise<void>;
}) {
  const { t } = useI18n();
  const safeTotalSlots = Number.isFinite(totalSlots) && totalSlots > 0 ? totalSlots : 0;
  const safeAvailableSlots =
    Number.isFinite(availableSlots) && availableSlots > 0 ? availableSlots : 0;
  const filled = Math.max(0, safeTotalSlots - safeAvailableSlots);
  const percentFilled =
    safeTotalSlots === 0 ? 0 : Math.min(100, Math.max(0, (filled / safeTotalSlots) * 100));

  const isFull = safeAvailableSlots <= 0;
  const joinDisabled = joining || isFull || !onJoin;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {serviceName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span className="truncate">{t("card.host", { name: ownerName })}</span>
            {typeof rating === "number" ? (
              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span aria-hidden="true">★</span>
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="sr-only">Rating {rating.toFixed(1)} out of 5</span>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">{t("card.noRatings")}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {formatMoney(price)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t("card.perMonth")}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {t("card.slotsAvailable", { available: safeAvailableSlots, total: safeTotalSlots })}
          </span>
          <span>{t("card.filled", { percent: Math.round(percentFilled) })}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/60">
          <div
            className="h-full rounded-full bg-primary-600 transition-[width] duration-300 ease-out dark:bg-primary-500"
            style={{ width: `${percentFilled}%` }}
            role="progressbar"
            aria-label="Slots filled"
            aria-valuenow={Math.round(percentFilled)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {isFull ? t("card.noSeatsLeft") : t("card.seatsAvailable")}
        </div>

        <button
          type="button"
          onClick={() => onJoin?.()}
          disabled={joinDisabled}
          className={[
            "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]",
            joinDisabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-900/60 dark:text-slate-500"
              : "bg-primary-600 text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700 hover:shadow-md focus:ring-primary-500",
          ].join(" ")}
          aria-disabled={joinDisabled}
        >
          {isFull ? t("card.full") : joining ? t("card.joining") : t("card.join")}
        </button>
      </div>
    </div>
  );
}

export function SubscriptionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/70 to-white/40 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/35 dark:to-slate-950/15">
      <div className="animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="w-28">
            <div className="ml-auto h-6 w-20 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 ml-auto h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="mt-5">
          <div className="h-3 w-44 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

