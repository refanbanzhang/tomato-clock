"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";

export default function AccountSection() {
  const { t } = useLocale();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="mt-5 pt-5 border-t border-teal-50 dark:border-slate-700/50">
        <p className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("authAccount")}</p>
        <p className="subtitle mt-1">{t("authAccountHint")}</p>
        <div className="data-actions">
          <Link href="/auth/login/" className="btn btn-primary py-2 text-sm">
            {t("authLoginBtn")}
          </Link>
          <Link href="/auth/register/" className="btn btn-muted py-2 text-sm">
            {t("authRegisterBtn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5 border-t border-teal-50 dark:border-slate-700/50">
      <p className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("authAccount")}</p>
      <p className="subtitle mt-1">{user.email}</p>
    </div>
  );
}
