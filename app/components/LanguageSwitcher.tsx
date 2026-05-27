"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 h-10 px-2.5 text-sm whitespace-nowrap rounded-[0.625rem] text-slate-400 transition-colors hover:text-teal-900 hover:bg-teal-50/60 dark:text-slate-500 dark:hover:text-teal-400 dark:hover:bg-teal-400/10"
        aria-label="Switch language"
        title={LOCALE_LABELS[locale]}
      >
        <span>{LOCALE_LABELS[locale]}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-max min-w-full whitespace-nowrap card py-1 z-50 shadow-lg">
          {SUPPORTED_LOCALES.map((l: Locale) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left whitespace-nowrap transition-colors hover:bg-teal-50 dark:hover:bg-slate-700 ${
                locale === l
                  ? "text-teal-600 dark:text-teal-400 font-medium"
                  : "text-teal-950 dark:text-slate-200"
              }`}
            >
              <span>{LOCALE_LABELS[l]}</span>
              {locale === l && (
                <svg className="w-4 h-4 ml-auto text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
