"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Locale, Translations, TFn } from "./types";

// Import all locale files statically
import zhCN from "./locales/zh-CN.json";
import zhTW from "./locales/zh-TW.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

const LOCALE_STORAGE_KEY = "tomato-clock-locale";

const translations: Record<Locale, Translations> = {
  "zh-CN": zhCN as Translations,
  "zh-TW": zhTW as Translations,
  en: en as Translations,
  ja: ja as Translations,
  ko: ko as Translations,
};

const LOCALE_LABELS: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
};

const SUPPORTED_LOCALES: Locale[] = ["zh-CN", "zh-TW", "en", "ja", "ko"];

function detectLocale(): Locale {
  // 1. Check URL param ?lang=xx
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang") as Locale | null;
    if (langParam && SUPPORTED_LOCALES.includes(langParam)) {
      return langParam;
    }
  }

  // 2. Check localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (stored && SUPPORTED_LOCALES.includes(stored)) {
        return stored;
      }
    } catch {
      // localStorage not available
    }
  }

  // 3. Match browser language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language;
    // Exact match
    const exact = SUPPORTED_LOCALES.find((l) => l === browserLang);
    if (exact) return exact;
    // Prefix match (e.g., "zh" → "zh-CN", "ja" → "ja")
    const prefix = browserLang.split("-")[0];
    const prefixMatch = SUPPORTED_LOCALES.find((l) => l.startsWith(prefix));
    if (prefixMatch) return prefixMatch;
    // Special case: zh-HK → zh-TW
    if (browserLang === "zh-HK" || browserLang === "zh-MO" || browserLang === "zh-SG") {
      return "zh-TW";
    }
  }

  return "zh-CN"; // default
}

// --- Date/Time helpers ---

// Locale mapping for JS Intl (zh-TW needs special handling)
function toBCP47(locale: Locale): string {
  switch (locale) {
    case "zh-TW":
      return "zh-Hant-TW";
    default:
      return locale;
  }
}

export function formatDate(locale: Locale, date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString(toBCP47(locale), options);
}

export function formatTime(locale: Locale, date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleTimeString(toBCP47(locale), options);
}

// --- Context ---

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFn;
  localeLabels: Record<Locale, string>;
  supportedLocales: Locale[];
  toBCP47: (locale: Locale) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function LocaleProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || "zh-CN");
  const [initialized, setInitialized] = useState(false);

  // Initialize locale on mount
  useEffect(() => {
    if (!initialLocale) {
      setLocaleState(detectLocale());
    }
    setInitialized(true);
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
    // Update html lang attribute
    document.documentElement.lang = toBCP47(newLocale);
  }, []);

  // Update html lang on locale change
  useEffect(() => {
    if (initialized) {
      document.documentElement.lang = toBCP47(locale);
    }
  }, [locale, initialized]);

  // Translation function
  const t: TFn = useCallback(
    (key: keyof Translations, params?: Record<string, string | number>): string => {
      const msg = translations[locale]?.[key];
      if (msg === undefined || msg === null) {
        // Fallback to zh-CN
        const fallback = translations["zh-CN"]?.[key];
        if (fallback === undefined || fallback === null) return key;
        return interpolate(fallback, params);
      }
      return interpolate(msg, params);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      localeLabels: LOCALE_LABELS,
      supportedLocales: SUPPORTED_LOCALES,
      toBCP47,
    }),
    [locale, setLocale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextType {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}

// Standalone t function for non-React contexts (e.g., lib files)
export function getTranslation(locale: Locale, key: keyof Translations, params?: Record<string, string | number>): string {
  const msg = translations[locale]?.[key] ?? translations["zh-CN"]?.[key];
  if (msg === undefined || msg === null) return key;
  return interpolate(msg, params);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

export { LOCALE_LABELS, SUPPORTED_LOCALES };
