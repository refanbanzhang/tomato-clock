"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import TimerDisplay from "./components/TimerDisplay";
import TimerControls from "./components/TimerControls";
import SettingsPanel from "./components/SettingsPanel";
import { useNotification, useAudio, useKeyboardShortcut } from "./components/hooks";
import { useSupabaseSync } from "./components/useSupabaseSync";
import {
  loadState,
  saveState,
  addSession,
  setWeeklyTarget,
} from "@/lib/store";
import { FOCUS_SECONDS, AppState } from "@/lib/types";
import {
  createInitialTimerState,
  TimerState,
} from "@/lib/timer-engine";

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [timer, setTimer] = useState<TimerState>(createInitialTimerState());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppState | null>(null);
  const { requestPermission, notify } = useNotification();
  const { playBeep } = useAudio();

  // Load state on mount
  useEffect(() => {
    const state = loadState();
    setAppState(state);
  }, []);

  // Save state on change
  useEffect(() => {
    if (appState) {
      appStateRef.current = appState;
      saveState(appState);
    }
  }, [appState]);

  // Supabase sync
  const { triggerUpload } = useSupabaseSync({
    onRemoteState: (remote) => {
      setAppState(remote);
    },
    getCurrentState: () => appStateRef.current!,
  });

  // Upload to Supabase when state changes (after initial load)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (appState && initialLoadDone.current) {
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
    });
    startTick(() => {
      // focus completed
      setTimer((prev) => ({
        ...prev,
        mode: "idle",
        remainingSeconds: FOCUS_SECONDS,
        totalSeconds: FOCUS_SECONDS,
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

      notify("番茄完成", "已记录。");
      playBeep();
    });
  }, [requestPermission, startTick, notify, playBeep]);

  const handlePause = useCallback(() => {
    stopTimer();
    setTimer((prev) => ({ ...prev, mode: "paused" }));
  }, [stopTimer]);

  const handleResume = useCallback(() => {
    setTimer((prev) => ({ ...prev, mode: "focusing" }));
    startTick(() => {});
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

  const handleSetTarget = useCallback((target: number) => {
    setAppState((prev) => {
      if (!prev) return prev;
      return setWeeklyTarget(prev, target);
    });
  }, []);

  // Keyboard shortcut (Space)
  const handleSpaceShortcut = useCallback(() => {
    if (timer.mode === "idle") handleStartFocus();
    else if (timer.mode === "focusing") handlePause();
    else if (timer.mode === "paused") handleResume();
  }, [timer.mode, handleStartFocus, handlePause, handleResume]);

  useKeyboardShortcut(" ", handleSpaceShortcut, true);

  if (!appState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-slate-400 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center py-8 px-4">
      {/* Navigation */}
      <nav className="w-full max-w-md mb-8">
        <div className="flex rounded-xl bg-white border border-stone-200 p-1 shadow-sm">
          <Link
            href="/"
            className="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-stone-800 text-white shadow-sm"
          >
            计时器
          </Link>
          <Link
            href="/calendar"
            className="flex-1 text-center py-2 text-sm font-medium rounded-lg text-slate-500 hover:text-slate-700 hover:bg-stone-50 transition-colors"
          >
            日历
          </Link>
        </div>
      </nav>

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
          remainingSeconds={timer.remainingSeconds}
          onStart={handleStartFocus}
          onPause={handlePause}
          onResume={handleResume}
          onFinishEarly={handleFinishEarly}
          onAbandon={handleAbandon}
        />

        {/* Settings */}
        <SettingsPanel
          weeklyTarget={appState.weeklyTarget}
          onSetTarget={handleSetTarget}
        />
      </div>

      {/* Footer */}
      <footer className="mt-12 mb-4 text-xs text-slate-300">
        Tomato Clock v0.1.0
      </footer>
    </div>
  );
}
