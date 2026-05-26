"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import StatsPanel from "./components/StatsPanel";
import SettingsPanel from "./components/SettingsPanel";
import CompletionDialog from "./components/CompletionDialog";
import { useNotification, useAudio, useKeyboardShortcut } from "./components/hooks";
import {
  loadState,
  saveState,
  computeProgress,
  addSession,
  setWeeklyTarget,
  setStatsMode,
} from "@/lib/store";
import {
  FOCUS_SECONDS,
  AppState,
  ProgressSnapshot,
  BreakType,
  StatsMode,
} from "@/lib/types";
import {
  createInitialTimerState,
  getBreakType,
  getBreakSeconds,
  TimerState,
} from "@/lib/timer-engine";

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [timer, setTimer] = useState<TimerState>(createInitialTimerState());
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedBreakType, setCompletedBreakType] = useState<BreakType>("short");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();

  // Load state on mount
  useEffect(() => {
    const state = loadState();
    setAppState(state);
    setProgress(computeProgress(state, new Date()));
  }, []);

  // Save state on change
  useEffect(() => {
    if (appState) saveState(appState);
  }, [appState]);

  // Recompute progress periodically
  useEffect(() => {
    if (!appState) return;
    const id = setInterval(() => {
      setProgress(computeProgress(appState, new Date()));
    }, 10000);
    return () => clearInterval(id);
  }, [appState]);

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
          if (prev.remainingSeconds <= 1) {
            stopTimer();
            setTimeout(onComplete, 0);
            return { ...prev, remainingSeconds: 0 };
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    },
    [stopTimer]
  );

  const handleStartFocus = useCallback(() => {
    requestPermission();
    setTimer({
      mode: "focusing",
      remainingSeconds: FOCUS_SECONDS,
      totalSeconds: FOCUS_SECONDS,
      completedInStreak: timer.completedInStreak,
    });
    startTick(() => {
      // focus completed naturally
      const bt = getBreakType(timer.completedInStreak);
      const newStreak = timer.completedInStreak + 1;
      setTimer((prev) => ({
        ...prev,
        mode: "idle",
        remainingSeconds: FOCUS_SECONDS,
        totalSeconds: FOCUS_SECONDS,
        completedInStreak: newStreak,
      }));

      // Record session
      const now = new Date();
      setAppState((prev) => {
        if (!prev) return prev;
        return addSession(prev, {
          id: crypto.randomUUID(),
          startDate: new Date(now.getTime() - FOCUS_SECONDS * 1000).toISOString(),
          endDate: now.toISOString(),
          plannedSeconds: FOCUS_SECONDS,
          completed: true,
        });
      });

      notify("番茄完成", "已计入本周进度。");
      playBeep();

      // Show completion dialog
      setCompletedBreakType(bt);
      setShowCompletion(true);
    });
  }, [requestPermission, timer.completedInStreak, startTick, notify, playBeep]);

  const handlePause = useCallback(() => {
    stopTimer();
    setTimer((prev) => ({ ...prev, mode: "paused" }));
  }, [stopTimer]);

  const handleResume = useCallback(() => {
    setTimer((prev) => ({ ...prev, mode: "focusing" }));
    startTick(() => {
      // shouldn't happen on resume, but handle anyway
    });
  }, [startTick]);

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
    setTimer((prev) => ({
      ...prev,
      mode: "idle",
      remainingSeconds: FOCUS_SECONDS,
      totalSeconds: FOCUS_SECONDS,
    }));
  }, [stopTimer, timer.remainingSeconds]);

  const handleAbandon = useCallback(() => {
    stopTimer();
    setTimer((prev) => ({
      ...prev,
      mode: "idle",
      remainingSeconds: FOCUS_SECONDS,
      totalSeconds: FOCUS_SECONDS,
    }));
  }, [stopTimer]);

  const handleStartBreak = useCallback(() => {
    setShowCompletion(false);
    const seconds = getBreakSeconds(completedBreakType);
    setTimer({
      mode: "resting",
      remainingSeconds: seconds,
      totalSeconds: seconds,
      completedInStreak: 0,
    });
    startTick(() => {
      setTimer((prev) => ({
        ...prev,
        mode: "idle",
        remainingSeconds: FOCUS_SECONDS,
        totalSeconds: FOCUS_SECONDS,
      }));
    });
  }, [completedBreakType, startTick]);

  const handleLater = useCallback(() => {
    setShowCompletion(false);
  }, []);

  const handleStopBreak = useCallback(() => {
    stopTimer();
    setTimer((prev) => ({
      ...prev,
      mode: "idle",
      remainingSeconds: FOCUS_SECONDS,
      totalSeconds: FOCUS_SECONDS,
    }));
  }, [stopTimer]);

  const handleSetTarget = useCallback((target: number) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return setWeeklyTarget(prev, target);
    });
  }, []);

  const handleStatsModeChange = useCallback((mode: StatsMode) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return setStatsMode(prev, mode);
    });
  }, []);

  // Keyboard shortcut (Space)
  const handleSpaceShortcut = useCallback(() => {
    if (timer.mode === "idle") handleStartFocus();
    else if (timer.mode === "focusing") handlePause();
    else if (timer.mode === "paused") handleResume();
  }, [timer.mode, handleStartFocus, handlePause, handleResume]);

  useKeyboardShortcut(" ", handleSpaceShortcut, true);

  if (!appState || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-slate-400 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2 justify-center">
          <span>🍅</span> 番茄时钟
        </h1>
      </header>

      {/* Main content */}
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Timer */}
        <TimerDisplay
          mode={timer.mode}
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={timer.totalSeconds}
        />

        {/* Controls */}
        <TimerControls
          mode={timer.mode}
          completedInStreak={timer.completedInStreak}
          remainingSeconds={timer.remainingSeconds}
          onStart={handleStartFocus}
          onPause={handlePause}
          onResume={handleResume}
          onFinishEarly={handleFinishEarly}
          onAbandon={handleAbandon}
          onStartBreak={handleStartBreak}
          onStopBreak={handleStopBreak}
        />

        {/* Stats */}
        <StatsPanel
          progress={progress}
          statsMode={appState.statsMode}
          onStatsModeChange={handleStatsModeChange}
        />

        {/* Settings */}
        <SettingsPanel
          weeklyTarget={appState.weeklyTarget}
          onSetTarget={handleSetTarget}
        />
      </div>

      {/* Completion Dialog */}
      <CompletionDialog
        show={showCompletion}
        breakType={completedBreakType}
        onStartBreak={handleStartBreak}
        onLater={handleLater}
      />

      {/* Footer */}
      <footer className="mt-12 mb-4 text-xs text-slate-300">
        Tomato Clock v0.1.0
      </footer>
    </div>
  );
}
