import { FOCUS_SECONDS, TimerMode } from "./types";

export interface TimerState {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  /** 专注中的绝对结束时间（毫秒），暂停时清除 */
  endAt?: number;
}

export function getRemainingSeconds(endAt: number): number {
  return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
}

/** 按墙钟校准剩余时间（切回前台、从 localStorage 恢复后使用） */
export function syncTimerFromWallClock(state: TimerState): TimerState {
  if (state.mode !== "focusing" || state.endAt == null) {
    return state;
  }
  return {
    ...state,
    remainingSeconds: getRemainingSeconds(state.endAt),
  };
}

interface PersistedTimer {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  endAt?: number;
}

const TIMER_STORAGE_KEY = "tomato-clock-timer";

export function createInitialTimerState(): TimerState {
  return {
    mode: "idle",
    remainingSeconds: FOCUS_SECONDS,
    totalSeconds: FOCUS_SECONDS,
  };
}

export function loadTimerState(): TimerState {
  if (typeof window === "undefined") {
    return createInitialTimerState();
  }

  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) {
      return createInitialTimerState();
    }

    const parsed = JSON.parse(raw) as PersistedTimer;
    if (parsed.mode === "idle") {
      return createInitialTimerState();
    }

    if (parsed.mode === "paused") {
      return {
        mode: "paused",
        remainingSeconds: parsed.remainingSeconds,
        totalSeconds: parsed.totalSeconds,
      };
    }

    if (parsed.mode === "focusing" && parsed.endAt) {
      return {
        mode: "focusing",
        remainingSeconds: getRemainingSeconds(parsed.endAt),
        totalSeconds: parsed.totalSeconds,
        endAt: parsed.endAt,
      };
    }
  } catch {
    // corrupted data, reset
  }

  return createInitialTimerState();
}

export function saveTimerState(state: TimerState): void {
  if (typeof window === "undefined") return;

  if (state.mode === "idle") {
    localStorage.removeItem(TIMER_STORAGE_KEY);
    return;
  }

  const payload: PersistedTimer = {
    mode: state.mode,
    remainingSeconds: state.remainingSeconds,
    totalSeconds: state.totalSeconds,
  };

  if (state.mode === "focusing" && state.endAt != null) {
    payload.endAt = state.endAt;
  }

  localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(payload));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
