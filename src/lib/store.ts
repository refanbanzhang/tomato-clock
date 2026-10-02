import { AppState, PomodoroSession } from "./types";

const STORAGE_KEY = "tomato-clock";
const OBSOLETE_KEYS = ["tomato-clock-state:preview", "token"];

function emptyState(): AppState {
  return { sessions: [] };
}

function parseStoredState(raw: string): AppState {
  const parsed = JSON.parse(raw) as AppState;
  if (!parsed || !Array.isArray(parsed.sessions)) {
    throw new Error("invalid tomato clock data");
  }
  return { sessions: parsed.sessions };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  for (const key of OBSOLETE_KEYS) localStorage.removeItem(key);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseStoredState(raw);
  } catch (error) {
    console.warn("[tomato-clock] drop invalid local data", error);
    localStorage.removeItem(STORAGE_KEY);
  }
  return emptyState();
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addSession(state: AppState, session: PomodoroSession): AppState {
  return { ...state, sessions: [...state.sessions, session] };
}
