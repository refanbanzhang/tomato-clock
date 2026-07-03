
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "@/components/AuthLayout";
import { handleAuthCallback } from "@/lib/auth/callback";
import { mapAuthError } from "@/lib/auth/errors";
import { authErrorMessage } from "@/lib/auth/messages";
import { useLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const hasAuthParams =
        window.location.hash.includes("access_token") ||
        window.location.search.includes("code=") ||
        window.location.hash.includes("error=") ||
        window.location.search.includes("error=");

      if (hasAuthParams) {
        console.info("[auth-login] auth params detected, processing callback");
        const result = await handleAuthCallback();
        if (!active) return;
        if (result.session) {
          navigate("/", { replace: true });
          return;
        }
        if (result.error) {
          setError(result.error);
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        navigate("/", { replace: true });
        return;
      }

      setChecking(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/", { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const trimmedEmail = email.trim();
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) throw signInError;
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("authErrorGeneric");
      const code = mapAuthError(msg);
      console.warn("[auth-login] signIn failed:", { email: trimmedEmail, code, msg });
      if (code === "invalid_credentials") {
        setError(t("authInvalidCredentials"));
        setMessage(t("authInvalidCredentialsHint"));
      } else {
        setError(authErrorMessage(t, code, msg));
        if (code === "email_rate_limit") {
          setMessage(t("authEmailRateLimitHint"));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthLayout title={t("authLoginTitle")} subtitle={t("authLoginSub")}>
        <div className="auth-form">
          <div className="loader auth-loader" role="status" aria-label={t("loading")} />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("authLoginTitle")} subtitle={t("authLoginSub")}>
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
            autoComplete="current-password"
            required
            minLength={6}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-msg">{message}</p>}
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? t("authLoading") : t("authLoginBtn")}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/auth/forgot-password" className="auth-link">
          {t("authForgotLink")}
        </Link>
        <span className="auth-sep">·</span>
        <Link to="/auth/register" className="auth-link">
          {t("authRegisterLink")}
        </Link>
      </div>
    </AuthLayout>
  );
}
