"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

export default function HomePage() {
  const { t } = useI18n();

  const steps = [
    { title: t("home.how.step1.title"), description: t("home.how.step1.desc") },
    { title: t("home.how.step2.title"), description: t("home.how.step2.desc") },
    { title: t("home.how.step3.title"), description: t("home.how.step3.desc") },
  ];

  const tiers = [
    {
      name: t("home.tier.member.name"),
      price: "$0",
      cadence: "forever",
      description: t("home.tier.member.desc"),
      features: [
        t("home.tier.member.features.1"),
        t("home.tier.member.features.2"),
        t("home.tier.member.features.3"),
        t("home.tier.member.features.4"),
      ],
      cta: { label: t("home.tier.member.cta"), href: "/listings" },
      highlighted: false,
    },
    {
      name: t("home.tier.host.name"),
      price: "3%",
      cadence: "fee",
      description: t("home.tier.host.desc"),
      features: [
        t("home.tier.host.features.1"),
        t("home.tier.host.features.2"),
        t("home.tier.host.features.3"),
        t("home.tier.host.features.4"),
      ],
      cta: { label: t("home.tier.host.cta"), href: "/listings/create" },
      highlighted: true,
    },
    {
      name: t("home.tier.pro.name"),
      price: "$9",
      cadence: "per month",
      description: t("home.tier.pro.desc"),
      features: [
        t("home.tier.pro.features.1"),
        t("home.tier.pro.features.2"),
        t("home.tier.pro.features.3"),
        t("home.tier.pro.features.4"),
      ],
      cta: { label: t("home.tier.pro.cta"), href: "/auth/signup" },
      highlighted: false,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-gradient-to-r from-primary-500/20 via-sky-500/10 to-fuchsia-500/10 blur-3xl dark:from-primary-400/10 dark:via-sky-400/5 dark:to-fuchsia-400/5"
        />
        <div className="mx-auto max-w-6xl pt-16 sm:pt-20 pb-14 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-sm text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              {t("home.badge")}
            </div>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("home.title")}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-600 dark:text-slate-300">
              {t("home.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all duration-200 hover:bg-primary-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
              >
                {t("home.ctaPrimary")}
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-7 py-3.5 text-base font-semibold text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-950/50 dark:focus:ring-slate-700"
              >
                {t("home.ctaSecondary")}
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              {t("home.footnote")}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: t("home.highlights.clarity.label"), value: t("home.highlights.clarity.value") },
              { label: t("home.highlights.fast.label"), value: t("home.highlights.fast.value") },
              { label: t("home.highlights.minimal.label"), value: t("home.highlights.minimal.value") },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white/80 to-white/50 p-6 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/20"
              >
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </div>
                <div className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl py-16 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("home.how.title")}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              {t("home.how.subtitle")}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/10 text-primary-700 dark:bg-primary-400/10 dark:text-primary-300">
                    <span className="text-sm font-semibold">{String(idx + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {t("home.pricing.title")}
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
              {t("home.pricing.subtitle")}
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t("home.pricing.note")}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={[
                  "relative rounded-2xl border p-6 shadow-sm backdrop-blur",
                  tier.highlighted
                    ? "border-primary-500/40 bg-white/75 ring-1 ring-primary-500/20 dark:border-primary-400/30 dark:bg-slate-950/35"
                    : "border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/30",
                ].join(" ")}
              >
                {tier.highlighted ? (
                  <div className="absolute -top-3 left-6 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-primary-600/20">
                    {t("home.pricing.popular")}
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {tier.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {tier.price}
                  </div>
                  <div className="pb-1 text-sm text-slate-500 dark:text-slate-400">
                    / {tier.cadence}
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-primary-600/10 text-primary-700 dark:bg-primary-400/10 dark:text-primary-300">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3 w-3"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href={tier.cta.href}
                    className={[
                      "inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]",
                      tier.highlighted
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-xl focus:ring-primary-500"
                        : "border border-slate-200 bg-white/70 text-slate-900 shadow-sm shadow-black/5 backdrop-blur hover:bg-white hover:shadow-md focus:ring-slate-300 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-950/50 dark:focus:ring-slate-700",
                    ].join(" ")}
                  >
                    {tier.cta.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-white/70 to-white/40 p-8 sm:p-10 shadow-sm shadow-black/5 backdrop-blur dark:border-slate-800 dark:from-slate-950/35 dark:to-slate-950/15">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary-500/10 blur-2xl dark:bg-primary-400/10"
            />
            <div className="max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {t("home.final.title")}
              </h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {t("home.final.subtitle")}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))]"
                >
                  {t("home.final.primary")}
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-sm shadow-black/5 backdrop-blur transition-all duration-200 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-950/50 dark:focus:ring-slate-700"
                >
                  {t("home.final.secondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
