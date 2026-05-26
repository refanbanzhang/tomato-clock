import {
  AppState,
  PomodoroSession,
  DEFAULT_WEEKLY_TARGET,
} from "./types";

const STORAGE_KEY = "tomato-clock-state";

export function loadState(): AppState {
  if (typeof window === "undefined") {
    return {
      weeklyTarget: DEFAULT_WEEKLY_TARGET,
      sessions: [],
      targetChanges: [],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        weeklyTarget: parsed.weeklyTarget ?? DEFAULT_WEEKLY_TARGET,
        sessions: parsed.sessions ?? [],
        targetChanges: parsed.targetChanges ?? [],
      };
    }
  } catch {
    // corrupted data, reset
  }
  return {
    weeklyTarget: DEFAULT_WEEKLY_TARGET,
    sessions: [],
    targetChanges: [],
  };
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addSession(state: AppState, session: PomodoroSession): AppState {
  return { ...state, sessions: [...state.sessions, session] };
}

export function setWeeklyTarget(state: AppState, newTarget: number): AppState {
  return {
    ...state,
    weeklyTarget: newTarget,
    targetChanges: [
      ...state.targetChanges,
      {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        oldValue: state.weeklyTarget,
        newValue: newTarget,
      },
    ],
  };
}
