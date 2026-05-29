"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import AppNav from "./AppNav";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const { t } = useLocale();

  return (
    <div className="page">
      <AppNav />
      <main className="page-inner auth-wrap">
        <div className="auth-card card">
          <header className="auth-head">
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-sub">{subtitle}</p>}
          </header>
          {children}
          <p className="auth-back">
            <Link href="/landing/" className="auth-link">
              {t("authBackHome")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
