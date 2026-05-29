"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import { useLocale } from "@/lib/i18n";
import { handleAuthCallback } from "@/lib/auth/callback";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const hasAuthParams =
        window.location.hash.includes("access_token") ||
        window.location.search.includes("code=");

      if (hasAuthParams) {
        console.info("[auth-reset] processing recovery tokens");
        const result = await handleAuthCallback();
        if (!active) return;
        if (result.session) {
          setReady(true);
          return;
        }
        if (result.error) {
          setError(result.error);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        setReady(true);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError(t("authPasswordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("authErrorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <AuthLayout title={t("authResetTitle")} subtitle={t("authResetWaiting")}>
        <div className="auth-form">
          <div className="loader auth-loader" role="status" aria-label={t("loading")} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("authResetTitle")} subtitle={t("authResetSub")}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className="auth-label">{t("authNewPassword")}</span>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        <label className="auth-field">
          <span className="auth-label">{t("authConfirmPassword")}</span>
          <input
            className="auth-input"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? t("authLoading") : t("authResetBtn")}
        </button>
      </form>
    </AuthLayout>
  );
}
