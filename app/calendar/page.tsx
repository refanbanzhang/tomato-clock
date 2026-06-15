"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppNav from "../components/AppNav";
import CalendarView from "../components/CalendarView";
import StatsSummary from "../components/StatsSummary";
import PageTools from "../components/PageTools";
import SettingsModal from "../components/SettingsModal";
import Toast from "../components/Toast";
import { useSupabaseSync } from "../components/useSupabaseSync";
import { loadState, saveState, setWeeklyTarget, stateStorageKey } from "@/lib/store";
import { createSyncAuth } from "@/lib/supabase-sync";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";
import type { AppState } from "@/lib/types";

export default function CalendarPage() {
  const { t } = useLocale();
  const { session } = useAuth();
  const userId = session?.user.id;
  const syncAuth = session
    ? createSyncAuth(session.user.id, session.access_token)
    : null;
  const [appState, setAppState] = useState<AppState | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!userId) return;
    setAppState(loadState(userId));
    initialLoadDone.current = false;
  }, [userId]);

  useEffect(() => {
    if (appState && userId) {
      appStateRef.current = appState;
      saveState(appState, userId);
    }
  }, [appState, userId]);

  const { triggerUpload } = useSupabaseSync({
    auth: syncAuth,
    localReady: appState !== null,
    onRemoteState: (remote) => {
      setAppState(remote);
    },
    getCurrentState: () => appStateRef.current!,
  });

  useEffect(() => {
    if (appState && initialLoadDone.current) {
      triggerUpload();
    }
    if (appState && !initialLoadDone.current) {
      initialLoadDone.current = true;
    }
  }, [appState, triggerUpload]);

  useEffect(() => {
    if (!userId) return;
    const key = stateStorageKey(userId);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAppState(parsed);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userId]);

  const handleSetTarget = useCallback((target: number) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return setWeeklyTarget(prev, target);
    });
  }, []);

  const handleImport = useCallback(
    (imported: AppState) => {
      setAppState(imported);
      setShowSettings(false);
      setToast({
        message: t("importSuccess"),
        sub: t("importSuccessSub", { n: imported.sessions.length }),
      });
    },
    [t]
  );

  const handleImportError = useCallback((message: string) => {
    setToast({ message });
  }, []);

  if (!appState) {
    return (
      <div className="page">
        <PageTools onSettingsClick={() => setShowSettings(true)} />
        <AppNav />
        <div className="flex flex-1 items-center justify-center">
          <div className="loader" role="status" aria-label={t("loading")} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageTools onSettingsClick={() => setShowSettings(true)} />

      <AppNav />

      <header className="page-inner mb-6 text-center">
        <h1 className="title">{t("calendarTitle")}</h1>
        <p className="subtitle mt-1.5">{t("calendarSubtitle")}</p>
      </header>

      <main className="page-inner w-full">
        <StatsSummary
          sessions={appState.sessions}
          weeklyTarget={appState.weeklyTarget}
        />

        <CalendarView sessions={appState.sessions} />
      </main>

      <footer className="footer">{t("footer")}</footer>

      {showSettings && (
        <SettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          appState={appState}
          onSetTarget={handleSetTarget}
          onImport={handleImport}
          onImportError={handleImportError}
          onAccountMessage={(message) => setToast({ message })}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          sub={toast.sub}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
