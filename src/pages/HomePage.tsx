import { useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/AppShell";
import Heatmap from "@/components/Heatmap";
import TimerDisplay from "@/components/TimerDisplay";
import TimerControls from "@/components/TimerControls";
import Toast from "@/components/Toast";
import { useNotification, useAudio, useKeyboardShortcut } from "@/components/hooks";
import { useSync, type SyncErrorType } from "@/components/useSync";
import { useLocale } from "@/lib/i18n";
import { loadState, saveState, addSession } from "@/lib/store";
import { FOCUS_SECONDS, AppState } from "@/lib/types";
import { countToday } from "@/lib/stats";
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
  const userId = "preview";
  const [appState, setAppState] = useState<AppState | null>(null);
  const [timer, setTimer] = useState<TimerState>(() => loadTimerState());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const clockRef = useRef<TimerState>(timer);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);

  useEffect(() => {
    if (!userId) return;
    setAppState(loadState(userId));
  }, [userId]);

  useEffect(() => {
    if (appState && userId) {
      appStateRef.current = appState;
      saveState(appState, userId);
    }
  }, [appState, userId]);

  useEffect(() => {
    clockRef.current = timer;
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

  const { syncNow } = useSync({
    localReady: appState !== null,
    getState: () => appStateRef.current!,
    getTimer: () => clockRef.current,
    onState: (next) => {
      appStateRef.current = next;
      setAppState(next);
    },
    onTimer: (next) => {
      clockRef.current = next;
      setTimer(next);
    },
    onSyncError: handleSyncError,
  });

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
            const next = { ...prev, remainingSeconds: 0 };
            clockRef.current = next;
            return next;
          }
          const next = { ...prev, remainingSeconds };
          clockRef.current = next;
          return next;
        });
      }, 1000);
    },
    [stopTimer]
  );

  const handleFocusComplete = useCallback(() => {
    stopTimer();

    const now = new Date();
    const currentState = appStateRef.current;
    if (!currentState) {
      console.warn("[tomato-clock] focus complete skipped: app state not ready");
      return;
    }

    const nextState = addSession(currentState, {
      id: crypto.randomUUID(),
      startDate: new Date(now.getTime() - FOCUS_SECONDS * 1000).toISOString(),
      endDate: now.toISOString(),
      plannedSeconds: FOCUS_SECONDS,
      completed: true,
    });
    appStateRef.current = nextState;
    setAppState(nextState);

    const nextClock = createInitialTimerState(Date.now());
    clockRef.current = nextClock;
    setTimer(nextClock);
    void syncNow();

    notify(t("notificationTitle"), t("notificationBody"));
    playBeep();
    setToast({ message: t("toastTitle"), sub: t("toastSubtitle") });
  }, [notify, playBeep, stopTimer, syncNow, t]);

  const handleStartFocus = useCallback(() => {
    requestPermission();
    const endAt = Date.now() + FOCUS_SECONDS * 1000;
    const nextClock: TimerState = {
      mode: "focusing",
      remainingSeconds: FOCUS_SECONDS,
      totalSeconds: FOCUS_SECONDS,
      endAt,
      updatedAt: Date.now(),
    };
    clockRef.current = nextClock;
    setTimer(nextClock);
    startTick(handleFocusComplete);
    void syncNow();
  }, [requestPermission, startTick, handleFocusComplete, syncNow]);

  const handlePause = useCallback(() => {
    stopTimer();
    const prev = clockRef.current;
    const nextClock: TimerState =
      prev.mode !== "focusing" || prev.endAt == null
        ? { ...prev, mode: "paused", updatedAt: Date.now() }
        : {
            mode: "paused",
            remainingSeconds: getRemainingSeconds(prev.endAt),
            totalSeconds: prev.totalSeconds,
            updatedAt: Date.now(),
          };
    clockRef.current = nextClock;
    setTimer(nextClock);
    void syncNow();
  }, [stopTimer, syncNow]);

  const handleResume = useCallback(() => {
    const prev = clockRef.current;
    const nextClock: TimerState = {
      ...prev,
      mode: "focusing",
      endAt: Date.now() + prev.remainingSeconds * 1000,
      updatedAt: Date.now(),
    };
    clockRef.current = nextClock;
    setTimer(nextClock);
    startTick(handleFocusComplete);
    void syncNow();
  }, [startTick, handleFocusComplete, syncNow]);

  const handleAbandon = useCallback(() => {
    stopTimer();
    const nextClock = createInitialTimerState(Date.now());
    clockRef.current = nextClock;
    setTimer(nextClock);
    void syncNow();
  }, [stopTimer, syncNow]);

  useEffect(() => {
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
          const next = { ...synced, remainingSeconds: 0 };
          clockRef.current = next;
          setTimeout(handleFocusComplete, 0);
          return next;
        }
        clockRef.current = synced;
        return synced;
      });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [handleFocusComplete]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const handleSpaceShortcut = useCallback(() => {
    if (timer.mode === "idle") handleStartFocus();
    else if (timer.mode === "focusing") handlePause();
    else if (timer.mode === "paused") handleResume();
  }, [timer.mode, handleStartFocus, handlePause, handleResume]);

  useKeyboardShortcut(" ", handleSpaceShortcut, true);

  if (!appState) {
    return (
      <AppShell title={t("timerTitle")}>
        <div className="flex flex-1 items-center justify-center py-16">
          <div className="loader" role="status" aria-label={t("loading")} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("timerTitle")}>
      <section className="focus-stage">
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
          onAbandon={handleAbandon}
        />
        <p className="today">
          {t("today")} {countToday(appState.sessions)} {t("weeklyProgressUnit")}
        </p>
      </section>

      <Heatmap sessions={appState.sessions} />

      {toast && (
        <Toast
          message={toast.message}
          sub={toast.sub}
          onDismiss={() => setToast(null)}
        />
      )}
    </AppShell>
  );
}
