"use client";

import { LocaleProvider } from "@/lib/i18n";

export default function LocaleWrapper({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>;
}
