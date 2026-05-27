"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AppNav from "./components/AppNav";
import TomatoIcon from "./components/TomatoIcon";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import SettingsPanel from "./components/SettingsPanel";
import Toast from "./components/Toast";
import Fireworks from "./components/Fireworks";
import WeeklyCompleteModal from "./components/WeeklyCompleteModal";
import PageTools from "./components/PageTools";
import { useNotification, useAudio, useKeyboardShortcut } from "./components/hooks";
import { useSupabaseSync } from "./components/useSupabaseSync";
import { useLocale } from "@/lib/i18n";
import {
  loadState,
  saveState,
  addSession,
  setWeeklyTarget,
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
  const [appState, setAppState] = useState<AppState | null>(null);
  const [timer, setTimer] = useState<TimerState>(() => loadTimerState());
  const [showSettings, setShowSettings] = useState(false);

  // ESC to close settings modal
  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSettings(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSettings]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const timerRestoredRef = useRef(false);
  const skipNextSync = useRef(false);
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
    const state = loadState();
    setAppState(state);
  }, []);

  useEffect(() => {
    if (appState) {
      appStateRef.current = appState;
      saveState(appState);
    }
  }, [appState]);

  useEffect(() => {
    saveTimerState(timer);
  }, [timer]);

  const { triggerUpload } = useSupabaseSync({
    onRemoteState: (remote) => {
      setAppState(remote);
    },
    getCurrentState: () => appStateRef.current!,
  });

  const initialLoadDone = useRef(false);
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
    });

    if (hitWeeklyTarget) {
      celebrateWeeklyComplete();
      return;
    }

    setToast({ message: t("toastTitle"), sub: t("toastSubtitle") + " \uD83C\uDF45" });
  }, [notify, playBeep, stopTimer, t, celebrateWeeklyComplete]);

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
      <div className="page items-center justify-center">
        <div className="loader" role="status" aria-label={t("loading")} />
      </div>
    );
  }

  return (
    <div className="page">
      <PageTools>
        <button
          onClick={() => setShowSettings(true)}
          className="icon-btn"
          aria-label={t("settings")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </PageTools>

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
        <div
          className="modal-backdrop"
          onClick={() => setShowSettings(false)}
          role="presentation"
        >
          <div
            className="modal card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <SettingsPanel
              weeklyTarget={appState.weeklyTarget}
              appState={appState}
              onSetTarget={(t) => {
                handleSetTarget(t);
                setShowSettings(false);
              }}
              onImport={handleImport}
              onImportError={handleImportError}
              onTestFireworks={celebrateWeeklyComplete}
            />
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowSettings(false)}
                className="btn btn-muted w-full py-2.5 text-sm"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
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
