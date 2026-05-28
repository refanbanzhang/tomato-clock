"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import TomatoIcon from "@/app/components/TomatoIcon";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useLocale } from "@/lib/i18n";

const ThemeToggle = dynamic(() => import("@/app/components/ThemeToggle"), {
  ssr: false,
});

export default function LandingPage() {
  const { t } = useLocale();

  useEffect(() => {
    document.title = t("landing_title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("landing_description"));
  }, [t]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
      {/* ========== 1. Nav ========== */}
      <nav className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 no-underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-200 cursor-pointer"
          >
            <TomatoIcon className="w-7 h-7 flex-shrink-0" />
            {t("landing_brand")}
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 font-semibold text-sm py-2.5 px-5 rounded-[10px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors duration-200"
            >
              {t("landing_cta_start")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ========== 2. Hero ========== */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-30px] w-[180px] h-[180px] rounded-full bg-teal-50 dark:bg-teal-900/20 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-[-20px] w-[100px] h-[100px] rounded-full bg-amber-50 dark:bg-amber-900/10 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-[11px] font-semibold tracking-wider uppercase text-teal-600 dark:text-teal-400 bg-teal-600/10 dark:bg-teal-400/10 rounded-full">
            {t("landing_hero_label")}
          </span>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[44px] font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            {t("landing_hero_line1")}{" "}
            <span className="text-teal-600 dark:text-teal-400">{t("landing_hero_highlight")}</span>
            {t("landing_hero_line3") && <> {t("landing_hero_line3")}</>}
          </h1>

          <p className="mt-5 max-w-xl mx-auto text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("landing_hero_desc1")} {t("landing_hero_desc2")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center font-semibold text-base px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors duration-200"
            >
              {t("landing_hero_btn")}
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center font-semibold text-base px-8 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
            >
              {t("landing_hero_learn")}
            </a>
          </div>

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            {t("landing_hero_sub")}
          </p>
        </div>
      </section>

      {/* ========== 3. Features ========== */}
      <section id="features" className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-center text-slate-900 dark:text-slate-100">
            {t("landing_why_title")}
          </h2>
          <p className="mt-3 text-center text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t("landing_why_sub")}
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-[880px] mx-auto">
            {/* Feature 1: Clock */}
            <div className="landing-card group cursor-pointer transition-shadow hover:shadow-md p-6 sm:p-8 text-center">
              <div className="landing-icon-box mx-auto mb-5 text-teal-600 dark:text-teal-400">
                <svg
                  className="w-5 h-5"
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
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_card1_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_card1_desc")}
              </p>
            </div>

            {/* Feature 2: Lightning */}
            <div className="landing-card group cursor-pointer transition-shadow hover:shadow-md p-6 sm:p-8 text-center">
              <div className="landing-icon-box mx-auto mb-5 text-teal-600 dark:text-teal-400">
                <svg
                  className="w-5 h-5"
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
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_card2_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_card2_desc")}
              </p>
            </div>

            {/* Feature 3: Chart */}
            <div className="landing-card group cursor-pointer transition-shadow hover:shadow-md p-6 sm:p-8 text-center">
              <div className="landing-icon-box mx-auto mb-5 text-teal-600 dark:text-teal-400">
                <svg
                  className="w-5 h-5"
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
              <h3 className="font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_card3_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_card3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 4. How it works ========== */}
      <section className="bg-white dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-center text-slate-900 dark:text-slate-100">
            {t("landing_steps_title")}
          </h2>
          <p className="mt-3 text-center text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t("landing_steps_sub")}
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3 max-w-[780px] mx-auto text-center">
            {/* Step 1 */}
            <div>
              <div className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-900 dark:bg-white shadow-sm flex items-center justify-center">
                <span className="text-white dark:text-slate-900 font-display text-xl font-bold">1</span>
              </div>
              <h3 className="mt-5 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_step1_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_step1_desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-900 dark:bg-white shadow-sm flex items-center justify-center">
                <span className="text-white dark:text-slate-900 font-display text-xl font-bold">2</span>
              </div>
              <h3 className="mt-5 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_step2_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_step2_desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div className="w-[52px] h-[52px] mx-auto rounded-full bg-slate-900 dark:bg-white shadow-sm flex items-center justify-center">
                <span className="text-white dark:text-slate-900 font-display text-xl font-bold">3</span>
              </div>
              <h3 className="mt-5 font-display text-[15px] font-bold text-slate-900 dark:text-slate-100">
                {t("landing_step3_title")}
              </h3>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                {t("landing_step3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. Stats ========== */}
      <section className="bg-slate-900 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center max-w-[760px] mx-auto">
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                25<span className="text-teal-400 dark:text-teal-400 text-xl ml-0.5">min</span>
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t("landing_stat_time")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                100%<span className="text-teal-400 dark:text-teal-400 text-xl ml-0.5">free</span>
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t("landing_stat_free")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                {t("landing_stat_platform")}
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t("landing_stat_platform_val")}</p>
            </div>
            <div>
              <p className="font-display text-3xl sm:text-[32px] font-bold text-white">
                {t("landing_stat_sync")}<span className="text-teal-400 dark:text-teal-400 text-xl ml-0.5">{t("landing_stat_sync_val")}</span>
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t("landing_stat_sync_label")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== 6. CTA + Footer ========== */}
      <section className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {t("landing_cta_title")}
          </h2>
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            {t("landing_cta_sub")}
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center font-semibold text-base px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors duration-200"
            >
              {t("landing_cta_btn")}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-100 dark:border-slate-700/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
              <TomatoIcon className="w-5 h-5" />
              <span>{t("landing_footer_brand")}</span>
            </div>
            <p className="text-xs text-slate-300 dark:text-slate-600">
              {t("landing_footer")}
            </p>
          </div>
        </footer>
      </section>
    </div>
  );
}
