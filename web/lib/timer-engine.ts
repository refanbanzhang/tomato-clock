import { FOCUS_SECONDS, TimerMode } from "./types";

export interface TimerState {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
}

export function createInitialTimerState(): TimerState {
  return {
    mode: "idle",
    remainingSeconds: FOCUS_SECONDS,
    totalSeconds: FOCUS_SECONDS,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
