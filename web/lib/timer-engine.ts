import {
  FOCUS_SECONDS,
  SHORT_BREAK_SECONDS,
  LONG_BREAK_SECONDS,
  LONG_BREAK_INTERVAL,
  TimerMode,
  BreakType,
} from "./types";

export interface TimerState {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  completedInStreak: number;
}

export function createInitialTimerState(): TimerState {
  return {
    mode: "idle",
    remainingSeconds: FOCUS_SECONDS,
    totalSeconds: FOCUS_SECONDS,
    completedInStreak: 0,
  };
}

export function getBreakType(completedInStreak: number): BreakType {
  return completedInStreak % LONG_BREAK_INTERVAL === 0 ? "long" : "short";
}

export function getBreakSeconds(breakType: BreakType): number {
  return breakType === "long" ? LONG_BREAK_SECONDS : SHORT_BREAK_SECONDS;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
