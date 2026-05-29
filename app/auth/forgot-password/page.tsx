"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthLayout from "@/app/components/AuthLayout";
import { mapAuthError } from "@/lib/auth/errors";
import { authErrorMessage } from "@/lib/auth/messages";
import { getAuthRedirectUrl } from "@/lib/base-path";
import { useLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const trimmedEmail = email.trim();
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        { redirectTo: getAuthRedirectUrl("/auth/reset-password/") }
      );
      if (resetError) throw resetError;
      setMessage(t("authResetEmailSent"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("authErrorGeneric");
      const code = mapAuthError(msg);
      console.warn("[auth-forgot] reset failed:", { email: trimmedEmail, code, msg });
      setError(authErrorMessage(t, code, msg));
      if (code === "email_rate_limit") {
        setMessage(t("authEmailRateLimitHint"));
      } else if (code === "email_send_failed") {
        setMessage(t("authEmailSendFailedHint"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t("authForgotTitle")} subtitle={t("authForgotSub")}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span className="auth-label">{t("authEmail")}</span>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-msg">{message}</p>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? t("authLoading") : t("authSendResetBtn")}
        </button>
      </form>
      <div className="auth-links">
        <Link href="/auth/login/" className="auth-link">
          {t("authLoginLink")}
        </Link>
      </div>
    </AuthLayout>
  );
}
