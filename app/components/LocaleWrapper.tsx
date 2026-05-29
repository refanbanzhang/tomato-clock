"use client";

import { LocaleProvider } from "@/lib/i18n";
import AuthGate from "./AuthGate";

export default function LocaleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <AuthGate>{children}</AuthGate>
    </LocaleProvider>
  );
}
