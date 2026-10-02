import { AppState, PomodoroSession } from "./types";

const STORAGE_KEY = "tomato-clock";
const OBSOLETE_KEYS = ["tomato-clock-state:preview", "token", "tomato-clock-sync-token"];

const DROPPED_SESSION_IDS = new Set([
  "349a5014-bfc1-49e2-915d-33a19414ece1",
  "36dbde7a-f785-4f8d-bd55-470a0f4b25de",
  "47a5ad0c-021f-4d01-a93d-137639a5a84e",
  "7ef67ce2-05b1-435b-a2bf-016f683eca26",
  "8a626f42-087b-4335-9952-0b89d2bfcf8b",
  "8e86769c-7692-4037-93d0-d50c964eb0f8",
  "a3180f08-fc74-4d79-9c08-dc614710c588",
  "cdada8ef-4e99-4e4f-b32d-514df3ea58d9",
  "db652e1c-91b9-4803-a191-3a64991aed54",
]);

export function keepSessions(sessions: PomodoroSession[]): PomodoroSession[] {
  return sessions.filter((session) => !DROPPED_SESSION_IDS.has(session.id));
}

function emptyState(): AppState {
  return { sessions: [] };
}

function parseStoredState(raw: string): AppState {
  const parsed = JSON.parse(raw) as AppState;
  if (!parsed || !Array.isArray(parsed.sessions)) {
    throw new Error("invalid tomato clock data");
  }
  return { sessions: keepSessions(parsed.sessions) };
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
