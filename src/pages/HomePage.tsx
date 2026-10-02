import { useState, useEffect, useCallback, useRef } from "react";
import AppShell from "@/components/AppShell";
import Heatmap from "@/components/Heatmap";
import TimerDisplay from "@/components/TimerDisplay";
import TimerControls from "@/components/TimerControls";
import Toast from "@/components/Toast";
import { useNotification, useAudio, useKeyboardShortcut } from "@/components/hooks";
import { loadState, saveState, addSession } from "@/lib/store";
import { scheduleSync } from "@/lib/sync";
import { FOCUS_SECONDS, AppState, PomodoroSession } from "@/lib/types";
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
  const [appState, setAppState] = useState<AppState | null>(null);
  const [timer, setTimer] = useState<TimerState>(() => loadTimerState());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const clockRef = useRef<TimerState>(timer);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const [syncNote, setSyncNote] = useState("");

  const applySessions = useCallback((sessions: PomodoroSession[]) => {
    const next = { sessions };
    appStateRef.current = next;
    setAppState(next);
  }, []);

  const runSync = useCallback(() => {
    return scheduleSync(() => appStateRef.current?.sessions ?? [], applySessions).then(
      () => setSyncNote("已同步"),
      (error: unknown) => {
        console.warn("[sync] failed", error);
        setSyncNote("同步失败");
      },
    );
  }, [applySessions]);

  useEffect(() => {
    setAppState(loadState());
  }, []);

  useEffect(() => {
    if (!appState) return;
    appStateRef.current = appState;
    saveState(appState);
  }, [appState]);

  useEffect(() => {
    clockRef.current = timer;
    saveTimerState(timer);
  }, [timer]);

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
    });
    appStateRef.current = nextState;
    setAppState(nextState);

    const nextClock = createInitialTimerState(Date.now());
    clockRef.current = nextClock;
    setTimer(nextClock);

    notify("番茄完成", "已记录。");
    playBeep();
    setToast({ message: "番茄完成！", sub: "已记录，继续保持节奏" });
    void runSync();
  }, [notify, playBeep, stopTimer, runSync]);

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
  }, [requestPermission, startTick, handleFocusComplete]);

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
  }, [stopTimer]);

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
  }, [startTick, handleFocusComplete]);

  const handleAbandon = useCallback(() => {
    stopTimer();
    const nextClock = createInitialTimerState(Date.now());
    clockRef.current = nextClock;
    setTimer(nextClock);
  }, [stopTimer]);

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

  const loaded = appState !== null;
  useEffect(() => {
    if (!loaded) return;
    void runSync();
    const kick = () => {
      if (document.visibilityState === "visible") void runSync();
    };
    const onOnline = () => void runSync();
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("online", onOnline);
    return () => {
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("online", onOnline);
    };
  }, [loaded, runSync]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const handleSpaceShortcut = useCallback(() => {
    if (timer.mode === "idle") handleStartFocus();
    else if (timer.mode === "focusing") handlePause();
    else if (timer.mode === "paused") handleResume();
  }, [timer.mode, handleStartFocus, handlePause, handleResume]);

  useKeyboardShortcut(" ", handleSpaceShortcut, true);

  if (!appState) {
    return (
      <AppShell title="番茄时钟">
        <p role="status">加载中</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="番茄时钟">
      <section>
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
        <p>
          <button type="button" onClick={handleFocusComplete}>
            测试完成
          </button>
        </p>
        <p>
          今天 {countToday(appState.sessions)} 个{syncNote ? `，${syncNote}` : ""}
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
