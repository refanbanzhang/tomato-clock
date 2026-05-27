"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "计时器" },
  { href: "/calendar", label: "日历" },
];

export default function AppNav() {
  const pathname = usePathname();

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
