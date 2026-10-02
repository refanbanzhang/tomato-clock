import {
  AppState,
  PomodoroSession,
  DEFAULT_WEEKLY_TARGET,
  DEFAULT_MONTHLY_TARGET,
  DEFAULT_YEARLY_TARGET,
} from "./types";

const STORAGE_PREFIX = "tomato-clock-state";

export function stateStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

function emptyState(): AppState {
  return {
    weeklyTarget: DEFAULT_WEEKLY_TARGET,
    monthlyTarget: DEFAULT_MONTHLY_TARGET,
    yearlyTarget: DEFAULT_YEARLY_TARGET,
    settingsUpdatedAt: 0,
    sessions: [],
    targetChanges: [],
  };
}

function parseStoredState(raw: string): AppState {
  const parsed = JSON.parse(raw);
  return {
    weeklyTarget: parsed.weeklyTarget ?? DEFAULT_WEEKLY_TARGET,
    monthlyTarget: parsed.monthlyTarget ?? DEFAULT_MONTHLY_TARGET,
    yearlyTarget: parsed.yearlyTarget ?? DEFAULT_YEARLY_TARGET,
    settingsUpdatedAt: parsed.settingsUpdatedAt ?? 0,
    sessions: parsed.sessions ?? [],
    targetChanges: parsed.targetChanges ?? [],
  };
}

export function loadState(userId: string): AppState {
  if (typeof window === "undefined") {
    return emptyState();
  }
  try {
    const raw = localStorage.getItem(stateStorageKey(userId));
    if (raw) return parseStoredState(raw);
  } catch {
    // corrupted data, reset
  }
  return emptyState();
}

export function saveState(state: AppState, userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(stateStorageKey(userId), JSON.stringify(state));
}

export function addSession(state: AppState, session: PomodoroSession): AppState {
  return { ...state, sessions: [...state.sessions, session] };
}
