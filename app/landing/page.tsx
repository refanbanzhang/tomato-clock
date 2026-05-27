"use client";

import { useEffect } from "react";
import Link from "next/link";
import TomatoIcon from "@/app/components/TomatoIcon";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useLocale } from "@/lib/i18n";

export default function LandingPage() {
  const { t } = useLocale();

  // Update document title on mount
  useEffect(() => {
    document.title = t("landing_title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("landing_description"));
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-teal-50 dark:bg-slate-900 text-teal-950 dark:text-slate-100 antialiased">
      {/* ========== Nav ========== */}
      <nav className="sticky top-0 z-40 bg-teal-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-teal-100/60 dark:border-slate-700/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-teal-950 dark:text-slate-100 no-underline hover:text-teal-900 dark:hover:text-teal-400 transition-colors duration-200 cursor-pointer"
          >
            <TomatoIcon className="w-7 h-7 flex-shrink-0" />
            {t("landing_brand")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link
              href="/"
              className="btn btn-cta text-sm py-2.5 px-5 rounded-lg"
            >
              {t("landing_cta_start")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-teal-950 dark:text-slate-100 leading-tight">
            {t("landing_hero_line1")}
            <span className="text-teal-600 dark:text-teal-400">{t("landing_hero_highlight")}</span>
            {t("landing_hero_line3")}
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-base sm:text-lg text-teal-900/70 dark:text-slate-300/70 leading-relaxed">
            {t("landing_hero_desc1")}
            <br className="hidden sm:block" />
            {t("landing_hero_desc2")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="btn btn-cta text-base px-8 py-3.5 rounded-xl"
            >
              {t("landing_hero_btn")}
            </Link>
            <p className="text-xs text-teal-900/40 dark:text-slate-400/40">
              {t("landing_hero_sub")}
            </p>
          </div>
        </div>
      </section>

      {/* ========== Features ========== */}
      <section className="bg-white dark:bg-slate-800/50 border-y border-teal-100/40 dark:border-slate-700/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-center text-teal-950 dark:text-slate-100">
            {t("landing_why_title")}
          </h2>
          <p className="mt-3 text-center text-sm text-teal-900/50 dark:text-slate-400/50 max-w-md mx-auto">
            {t("landing_why_sub")}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-teal-100/50 dark:border-slate-700/50 bg-teal-50/40 dark:bg-slate-800/40 p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-teal-500 dark:hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-slate-700/50">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-teal-500/30 dark:group-hover:bg-teal-500/20">
                <svg
                  className="w-6 h-6 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-teal-950 dark:text-slate-100">
                {t("landing_card1_title")}
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 dark:text-slate-400/60 leading-relaxed">
                {t("landing_card1_desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-teal-100/50 dark:border-slate-700/50 bg-teal-50/40 dark:bg-slate-800/40 p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-teal-500 dark:hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-slate-700/50">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-teal-500/30 dark:group-hover:bg-teal-500/20">
                <svg
                  className="w-6 h-6 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-teal-950 dark:text-slate-100">
                {t("landing_card2_title")}
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 dark:text-slate-400/60 leading-relaxed">
                {t("landing_card2_desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-teal-100/50 dark:border-slate-700/50 bg-teal-50/40 dark:bg-slate-800/40 p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-teal-500 dark:hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-slate-700/50">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-5 transition-colors duration-200 group-hover:bg-teal-500/30 dark:group-hover:bg-teal-500/20">
                <svg
                  className="w-6 h-6 text-teal-600 dark:text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-teal-950 dark:text-slate-100">
                {t("landing_card3_title")}
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 dark:text-slate-400/60 leading-relaxed">
                {t("landing_card3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== How it works ========== */}
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-center text-teal-950 dark:text-slate-100">
            {t("landing_steps_title")}
          </h2>
          <p className="mt-3 text-center text-sm text-teal-900/50 dark:text-slate-400/50 max-w-md mx-auto">
            {t("landing_steps_sub")}
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">1</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-teal-950 dark:text-slate-100">
                {t("landing_step1_title")}
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 dark:text-slate-400/60 leading-relaxed">
                {t("landing_step1_desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">2</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-teal-950 dark:text-slate-100">
                {t("landing_step2_title")}
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 dark:text-slate-400/60 leading-relaxed">
                {t("landing_step2_desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">3</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-teal-950 dark:text-slate-100">
                {t("landing_step3_title")}
              </h3>
              <p className="mt-2 text-sm text-teal-900/60 dark:text-slate-400/60 leading-relaxed">
                {t("landing_step3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Stats ========== */}
      <section className="bg-teal-600 dark:bg-teal-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                25<span className="text-teal-100 dark:text-teal-200 text-xl ml-0.5">min</span>
              </p>
              <p className="mt-2 text-sm text-teal-100/70 dark:text-teal-200/70">{t("landing_stat_time")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                100%<span className="text-teal-100 dark:text-teal-200 text-xl ml-0.5">free</span>
              </p>
              <p className="mt-2 text-sm text-teal-100/70 dark:text-teal-200/70">{t("landing_stat_free")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {t("landing_stat_platform")}
              </p>
              <p className="mt-2 text-sm text-teal-100/70 dark:text-teal-200/70">{t("landing_stat_platform_val")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-4xl font-bold text-white">
                {t("landing_stat_sync")}<span className="text-teal-100 dark:text-teal-200 text-xl ml-0.5">{t("landing_stat_sync_val")}</span>
              </p>
              <p className="mt-2 text-sm text-teal-100/70 dark:text-teal-200/70">{t("landing_stat_sync_label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-teal-950 dark:text-slate-100">
            {t("landing_cta_title")}
          </h2>
          <p className="mt-3 text-sm text-teal-900/50 dark:text-slate-400/50 max-w-md mx-auto">
            {t("landing_cta_sub")}
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="btn btn-cta text-base px-8 py-3.5 rounded-xl inline-flex"
            >
              {t("landing_cta_btn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="mt-auto border-t border-teal-100/40 dark:border-slate-700/40 bg-white dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-teal-900/40 dark:text-slate-400/40">
            <TomatoIcon className="w-5 h-5" />
            <span>{t("landing_footer_brand")}</span>
          </div>
          <p className="text-xs text-teal-900/30 dark:text-slate-500/30">
            {t("landing_footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
