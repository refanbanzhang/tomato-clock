"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { isPublicPath } from "@/lib/auth/public-paths";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAuth();
  const allowed = isPublicPath(pathname);

  useEffect(() => {
    if (loading || session || allowed) return;
    router.replace("/landing/");
  }, [loading, session, allowed, router]);

  if (!allowed && (loading || !session)) {
    return (
      <div className="page items-center justify-center">
        <div className="loader" role="status" />
      </div>
    );
  }

  return children;
}
