"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppNav from "../components/AppNav";
import StatsSummary from "../components/StatsSummary";
import GoalProgress from "../components/GoalProgress";
import CalendarView from "../components/CalendarView";
import PageTools from "../components/PageTools";
import SettingsModal from "../components/SettingsModal";
import Toast from "../components/Toast";
import { useSupabaseSync, type SyncErrorType } from "../components/useSupabaseSync";
import { loadState, saveState, setWeeklyTarget, setMonthlyTarget, setYearlyTarget, stateStorageKey } from "@/lib/store";
import { createSyncAuth } from "@/lib/supabase-sync";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n";
import type { AppState } from "@/lib/types";

export default function StatsPage() {
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

  const handleSyncError = useCallback(
    (type: SyncErrorType) => {
      if (type === "upload") {
        setToast({
          message: t("syncUploadError"),
          sub: t("syncUploadErrorSub"),
        });
        return;
      }
      setToast({
        message: t("syncPullError"),
        sub: t("syncPullErrorSub"),
      });
    },
    [t]
  );

  const { triggerUpload } = useSupabaseSync({
    auth: syncAuth,
    localReady: appState !== null,
    onRemoteState: (remote) => {
      setAppState(remote);
    },
    getCurrentState: () => appStateRef.current!,
    onSyncError: handleSyncError,
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

  const handleSetMonthlyTarget = useCallback((target: number) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return setMonthlyTarget(prev, target);
    });
  }, []);

  const handleSetYearlyTarget = useCallback((target: number) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return setYearlyTarget(prev, target);
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
        <h1 className="title">{t("statsTitle")}</h1>
        <p className="subtitle mt-1.5">{t("statsSubtitle")}</p>
      </header>

      <main className="page-inner w-full flex flex-col gap-4">
        <StatsSummary
          sessions={appState.sessions}
          weeklyTarget={appState.weeklyTarget}
          monthlyTarget={appState.monthlyTarget}
          yearlyTarget={appState.yearlyTarget}
        />

        <GoalProgress
          sessions={appState.sessions}
          target={appState.weeklyTarget}
          timeRange="week"
        />
        <GoalProgress
          sessions={appState.sessions}
          target={appState.monthlyTarget}
          timeRange="month"
        />
        <GoalProgress
          sessions={appState.sessions}
          target={appState.yearlyTarget}
          timeRange="year"
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
          onSetMonthlyTarget={handleSetMonthlyTarget}
          onSetYearlyTarget={handleSetYearlyTarget}
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
