
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";

export default function AppNav() {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const { session, loading } = useAuth();

  if (loading || !session) {
    return null;
  }

  const links = [
    { href: "/", label: t("navTimer") },
    { href: "/stats", label: t("navStats") },
  ];

  return (
    <nav className="tabs">
      {links.map(({ href, label }) => {
        const normalizedPath = pathname.replace(/\/$/, "") || "/";
        const normalizedHref = href.replace(/\/$/, "") || "/";
        const active = normalizedPath === normalizedHref;
        return (
          <Link
            key={href}
            to={href}
            className={`tab-link${active ? " tab-link-on" : ""}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
