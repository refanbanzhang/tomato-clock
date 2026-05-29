"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import { mapAuthError } from "@/lib/auth/errors";
import { authErrorMessage } from "@/lib/auth/messages";
import { getAuthRedirectUrl } from "@/lib/base-path";
import { useLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError(t("authPasswordMismatch"));
      return;
    }

    setLoading(true);
    const trimmedEmail = email.trim();
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: getAuthRedirectUrl("/auth/callback/"),
        },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace("/");
        return;
      }

      setMessage(t("authRegisterCheckEmail"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("authErrorGeneric");
      const code = mapAuthError(msg);
      console.warn("[auth-register] signUp failed:", { email: trimmedEmail, code, msg });
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
    <AuthLayout title={t("authRegisterTitle")} subtitle={t("authRegisterSub")}>
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
        <label className="auth-field">
          <span className="auth-label">{t("authPassword")}</span>
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
        {message && <p className="auth-msg">{message}</p>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !!message}>
          {loading ? t("authLoading") : t("authRegisterBtn")}
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
