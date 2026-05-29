"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";

export default function AppNav() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { session, loading } = useAuth();

  if (loading || !session) {
    return null;
  }

  const links = [
    { href: "/", label: t("navTimer") },
    { href: "/calendar", label: t("navCalendar") },
  ];

  return (
    <nav className="page-inner mb-8">
      <div className="card nav">
        {links.map(({ href, label }) => {
          // 生产环境 trailingSlash: true，pathname 带尾部斜杠（如 /calendar/），需要 normalize 后再比较
          const normalizedPath = pathname.replace(/\/$/, "") || "/";
          const normalizedHref = href.replace(/\/$/, "") || "/";
          const active = normalizedPath === normalizedHref;
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${active ? "nav-link-active" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
