"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppNav from "./components/AppNav";
import TomatoIcon from "./components/TomatoIcon";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import SettingsModal from "./components/SettingsModal";
import Toast from "./components/Toast";
import Fireworks from "./components/Fireworks";
import WeeklyCompleteModal from "./components/WeeklyCompleteModal";
import PageTools from "./components/PageTools";
import { useNotification, useAudio, useKeyboardShortcut } from "./components/hooks";
import { useSupabaseSync, type SyncErrorType } from "./components/useSupabaseSync";
import { useAuth } from "@/lib/auth/AuthProvider";
import { createSyncAuth } from "@/lib/supabase-sync";
import { useLocale } from "@/lib/i18n";
import {
  loadState,
  saveState,
  addSession,
  setWeeklyTarget,
  setMonthlyTarget,
  setYearlyTarget,
} from "@/lib/store";
import { FOCUS_SECONDS, AppState } from "@/lib/types";
import { willReachWeeklyTarget } from "@/lib/weekly-target";
import { countInWeek } from "@/lib/stats";
import {
  createInitialTimerState,
  getRemainingSeconds,
  loadTimerState,
  saveTimerState,
  syncTimerFromWallClock,
  TimerState,
} from "@/lib/timer-engine";

export default function Home() {
  const { t } = useLocale();
  const { session } = useAuth();
  const userId = session?.user.id;
  const syncAuth = session
    ? createSyncAuth(session.user.id, session.access_token)
    : null;
  const [appState, setAppState] = useState<AppState | null>(null);
  const [timer, setTimer] = useState<TimerState>(() => loadTimerState());
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const timerRestoredRef = useRef(false);
  const skipNextSync = useRef(false);
  const initialLoadDone = useRef(false);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const [fireworksKey, setFireworksKey] = useState(0);
  const [showWeeklyComplete, setShowWeeklyComplete] = useState(false);

  const triggerFireworks = useCallback(() => {
    setFireworksKey((key) => key + 1);
  }, []);

  const celebrateWeeklyComplete = useCallback(() => {
    console.info("[tomato-clock] celebrate weekly complete");
    triggerFireworks();
    setShowWeeklyComplete(true);
  }, [triggerFireworks]);

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

  useEffect(() => {
    saveTimerState(timer);
  }, [timer]);

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
      if (skipNextSync.current) {
        skipNextSync.current = false;
        return;
      }
      triggerUpload();
    }
    if (appState && !initialLoadDone.current) {
      initialLoadDone.current = true;
    }
  }, [appState, triggerUpload]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTick = useCallback(
    (onComplete: () => void) => {
      stopTimer();
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev.mode !== "focusing" || prev.endAt == null) {
            return prev;
          }
          const remainingSeconds = getRemainingSeconds(prev.endAt);
          if (remainingSeconds <= 0) {
            stopTimer();
            setTimeout(onComplete, 0);
            return { ...prev, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds };
        });
      }, 1000);
    },
    [stopTimer]
  );

  const handleFocusComplete = useCallback(() => {
    stopTimer();
    setTimer(createInitialTimerState());

    const now = new Date();
    const currentState = appStateRef.current;
    if (!currentState) {
      console.warn("[tomato-clock] focus complete skipped: app state not ready");
      return;
    }

    const weekCountBefore = countInWeek(currentState.sessions);
    const hitWeeklyTarget = willReachWeeklyTarget(
      currentState.sessions,
      currentState.weeklyTarget
    );

    setAppState(
      addSession(currentState, {
        id: crypto.randomUUID(),
        startDate: new Date(now.getTime() - FOCUS_SECONDS * 1000).toISOString(),
        endDate: now.toISOString(),
        plannedSeconds: FOCUS_SECONDS,
        completed: true,
      })
    );

    notify(t("notificationTitle"), t("notificationBody"));
    playBeep();

    console.info("[tomato-clock] focus complete", {
      hitWeeklyTarget,
      weekCountBefore,
      weeklyTarget: currentState.weeklyTarget,
      sessionCountAfter: currentState.sessions.length + 1,
      userId,
    });

    if (hitWeeklyTarget) {
      celebrateWeeklyComplete();
      return;
    }

    setToast({ message: t("toastTitle"), sub: t("toastSubtitle") + " \uD83C\uDF45" });
  }, [notify, playBeep, stopTimer, t, celebrateWeeklyComplete, userId]);

  const handleStartFocus = useCallback(() => {
    requestPermission();
    const endAt = Date.now() + FOCUS_SECONDS * 1000;
    setTimer({
      mode: "focusing",
      remainingSeconds: FOCUS_SECONDS,
      totalSeconds: FOCUS_SECONDS,
      endAt,
    });
    startTick(handleFocusComplete);
  }, [requestPermission, startTick, handleFocusComplete]);

  const handlePause = useCallback(() => {
    stopTimer();
    setTimer((prev) => {
      if (prev.mode !== "focusing" || prev.endAt == null) {
        return { ...prev, mode: "paused" };
      }
      return {
        mode: "paused",
        remainingSeconds: getRemainingSeconds(prev.endAt),
        totalSeconds: prev.totalSeconds,
      };
    });
  }, [stopTimer]);

  const handleResume = useCallback(() => {
    setTimer((prev) => {
      const endAt = Date.now() + prev.remainingSeconds * 1000;
      return { ...prev, mode: "focusing", endAt };
    });
    startTick(handleFocusComplete);
  }, [startTick, handleFocusComplete]);

  const handleFinishEarly = useCallback(() => {
    stopTimer();
    const now = new Date();
    const elapsed = FOCUS_SECONDS - timer.remainingSeconds;
    setAppState((prev) => {
      if (!prev) return prev;
      return addSession(prev, {
        id: crypto.randomUUID(),
        startDate: new Date(now.getTime() - elapsed * 1000).toISOString(),
        endDate: now.toISOString(),
        plannedSeconds: FOCUS_SECONDS,
        completed: false,
      });
    });
    setTimer(createInitialTimerState());
  }, [stopTimer, timer.remainingSeconds]);

  const handleAbandon = useCallback(() => {
    stopTimer();
    setTimer(createInitialTimerState());
  }, [stopTimer]);

  useEffect(() => {
    timerRestoredRef.current = true;

    if (timer.mode === "focusing" && timer.remainingSeconds <= 0) {
      handleFocusComplete();
      return;
    }

    if (timer.mode === "focusing" && timer.remainingSeconds > 0) {
      startTick(handleFocusComplete);
    }
  }, [appState, timer.mode, timer.remainingSeconds, startTick, handleFocusComplete]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setTimer((prev) => {
        const synced = syncTimerFromWallClock(prev);
        if (synced.mode === "focusing" && synced.remainingSeconds <= 0) {
          setTimeout(handleFocusComplete, 0);
          return { ...synced, remainingSeconds: 0 };
        }
        return synced;
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [handleFocusComplete]);

  useEffect(() => () => stopTimer(), [stopTimer]);

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

  const handleSpaceShortcut = useCallback(() => {
    if (timer.mode === "idle") handleStartFocus();
    else if (timer.mode === "focusing") handlePause();
    else if (timer.mode === "paused") handleResume();
  }, [timer.mode, handleStartFocus, handlePause, handleResume]);

  useKeyboardShortcut(" ", handleSpaceShortcut, true);

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

      <header className="page-inner mb-8 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <TomatoIcon />
          <h1 className="title">{t("timerTitle")}</h1>
        </div>
        <p className="subtitle mt-1.5">{t("timerSubtitle")}</p>
      </header>

      <main className="page-inner flex flex-col items-center gap-6 w-full">
        <TimerDisplay
          mode={timer.mode}
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={timer.totalSeconds}
        />
        <TimerControls
          mode={timer.mode}
          onStart={handleStartFocus}
          onPause={handlePause}
          onResume={handleResume}
          onFinishEarly={handleFinishEarly}
          onAbandon={handleAbandon}
        />
      </main>

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

      <footer className="footer">{t("footer")}</footer>

      {toast && (
        <Toast
          message={toast.message}
          sub={toast.sub}
          onDismiss={() => setToast(null)}
        />
      )}

      {fireworksKey > 0 && (
        <Fireworks
          key={fireworksKey}
          onDone={() => setFireworksKey(0)}
        />
      )}

      {showWeeklyComplete && (
        <WeeklyCompleteModal
          title={t("weeklyCompleteTitle")}
          message={t("weeklyCompleteSub")}
          buttonLabel={t("weeklyCompleteBtn")}
          onClose={() => setShowWeeklyComplete(false)}
        />
      )}
    </div>
  );
}
