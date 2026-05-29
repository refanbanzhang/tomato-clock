"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase/client";

interface AccountSectionProps {
  onMessage?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function AccountSection({ onMessage, onError }: AccountSectionProps) {
  const { t } = useLocale();
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async (e: FormEvent) => {
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
      setPassword("");
      setConfirm("");
      onMessage?.(t("authPasswordChanged"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("authErrorGeneric");
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onMessage?.(t("authSignedOut"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("authErrorGeneric");
      onError?.(msg);
    }
  };

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

      <form className="auth-form auth-form-compact mt-4" onSubmit={handleChangePassword}>
        <p className="text-sm font-medium text-teal-950 dark:text-slate-200">{t("authChangePassword")}</p>
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
        <button type="submit" className="btn btn-primary py-2 text-sm w-full" disabled={loading}>
          {loading ? t("authLoading") : t("authChangePasswordBtn")}
        </button>
      </form>

      <button
        type="button"
        onClick={handleSignOut}
        className="btn btn-muted py-2 text-sm w-full mt-3"
      >
        {t("authSignOut")}
      </button>
    </div>
  );
}
