"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";
import type { AppState } from "@/lib/types";
import SettingsPanel from "./SettingsPanel";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  appState: AppState;
  onSetTarget: (target: number) => void;
  onSetMonthlyTarget: (target: number) => void;
  onSetYearlyTarget: (target: number) => void;
  onImport: (state: AppState) => void;
  onImportError: (message: string) => void;
  onAccountMessage?: (message: string) => void;
}

export default function SettingsModal({
  open,
  onClose,
  appState,
  onSetTarget,
  onSetMonthlyTarget,
  onSetYearlyTarget,
  onImport,
  onImportError,
  onAccountMessage,
}: SettingsModalProps) {
  const { t } = useLocale();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSignOut = async () => {
    try {
      await signOut();
      onAccountMessage?.(t("authSignedOut"));
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("authErrorGeneric");
      onImportError(msg);
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label={t("close")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4l8 8M12 4l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <SettingsPanel
          weeklyTarget={appState.weeklyTarget}
          monthlyTarget={appState.monthlyTarget}
          yearlyTarget={appState.yearlyTarget}
          appState={appState}
          onSetTarget={(target) => {
            onSetTarget(target);
            onClose();
          }}
          onSetMonthlyTarget={(target) => {
            onSetMonthlyTarget(target);
            onClose();
          }}
          onSetYearlyTarget={(target) => {
            onSetYearlyTarget(target);
            onClose();
          }}
          onImport={onImport}
          onImportError={onImportError}
        />

        {user && (
          <div className="modal-footer">
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-muted w-full py-2.5 text-sm"
            >
              {t("authSignOut")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
