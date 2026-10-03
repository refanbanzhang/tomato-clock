import { FOCUS_SECONDS, TimerMode } from "./types";

export interface TimerState {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  /** 专注中的绝对结束时间（毫秒），暂停时清除 */
  endAt?: number;
  /** 开始、暂停、继续、完成、放弃时更新。滴答不要改它。 */
  updatedAt: number;
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
  updatedAt?: number;
}

export const FOCUS_TIMER_KEY = "tomato-clock-timer";

export function createInitialTimerState(
  updatedAt = 0,
  totalSeconds = FOCUS_SECONDS,
): TimerState {
  return {
    mode: "idle",
    remainingSeconds: totalSeconds,
    totalSeconds,
    updatedAt,
  };
}

export function loadTimerState(
  storageKey = FOCUS_TIMER_KEY,
  totalSeconds = FOCUS_SECONDS,
): TimerState {
  if (typeof window === "undefined") {
    return createInitialTimerState(0, totalSeconds);
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return createInitialTimerState(0, totalSeconds);
    }

    const parsed = JSON.parse(raw) as PersistedTimer;
    const updatedAt = parsed.updatedAt ?? 0;

    if (parsed.mode === "idle") {
      return createInitialTimerState(updatedAt, totalSeconds);
    }

    if (parsed.mode === "paused") {
      return {
        mode: "paused",
        remainingSeconds: parsed.remainingSeconds,
        totalSeconds: parsed.totalSeconds,
        updatedAt,
      };
    }

    if (parsed.mode === "focusing" && parsed.endAt) {
      return {
        mode: "focusing",
        remainingSeconds: getRemainingSeconds(parsed.endAt),
        totalSeconds: parsed.totalSeconds,
        endAt: parsed.endAt,
        updatedAt,
      };
    }
  } catch {
    // corrupted data, reset
  }

  return createInitialTimerState(0, totalSeconds);
}

export function saveTimerState(
  state: TimerState,
  storageKey = FOCUS_TIMER_KEY,
): void {
  if (typeof window === "undefined") return;

  const payload: PersistedTimer = {
    mode: state.mode,
    remainingSeconds: state.remainingSeconds,
    totalSeconds: state.totalSeconds,
    updatedAt: state.updatedAt,
  };

  if (state.mode === "focusing" && state.endAt != null) {
    payload.endAt = state.endAt;
  }

  localStorage.setItem(storageKey, JSON.stringify(payload));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
