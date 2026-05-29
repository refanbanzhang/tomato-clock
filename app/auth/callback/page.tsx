"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/app/components/AuthLayout";
import { handleAuthCallback } from "@/lib/auth/callback";
import { useLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const result = await handleAuthCallback();
      if (!active) return;

      if (result.error) {
        setError(result.error);
        setPending(false);
        return;
      }

      if (result.session) {
        router.replace("/");
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        console.info("[auth-callback] auth event:", event);
        if ((event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") && session) {
          router.replace(event === "PASSWORD_RECOVERY" ? "/auth/reset-password/" : "/");
        }
      });

      await new Promise((r) => setTimeout(r, 1500));
      if (!active) return;

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
        return;
      }

      subscription.unsubscribe();
      setError(t("authCallbackNoSession"));
      setPending(false);
    };

    run();

    return () => {
      active = false;
    };
  }, [router, t]);

  if (pending) {
    return (
      <AuthLayout title={t("authCallbackTitle")} subtitle={t("authCallbackSub")}>
        <div className="auth-form">
          <div className="loader auth-loader" role="status" aria-label={t("loading")} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("authCallbackFailed")} subtitle={t("authCallbackFailedSub")}>
      <div className="auth-form">
        {error && <p className="auth-error">{error}</p>}
        <Link href="/auth/login/" className="btn btn-primary auth-submit">
          {t("authLoginBtn")}
        </Link>
        <Link href="/auth/register/" className="btn btn-muted auth-submit">
          {t("authRegisterBtn")}
        </Link>
      </div>
    </AuthLayout>
  );
}
