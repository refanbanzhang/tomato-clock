import {
  AppState,
  DEFAULT_MONTHLY_TARGET,
  DEFAULT_WEEKLY_TARGET,
  DEFAULT_YEARLY_TARGET,
  PomodoroSession,
  TargetChange,
  TimerMode,
} from "./types";
import type { TimerState } from "./timer-engine";

const API = "https://tomato-sync.nevergiveuppiano.workers.dev";
const TOKEN_KEY = "token";
const SYNC_TOKEN = "ZV8WjTdfo8aSdehPBApFX8ntFtAQgHvSUgVK38738hMajJJbkzPCA4PRJYylU8xm";

export interface SyncTimer {
  mode: TimerMode;
  remainingSeconds: number;
  totalSeconds: number;
  endAt: number | null;
  updatedAt: number;
}

export interface SyncBlob {
  weeklyTarget: number;
  monthlyTarget: number;
  yearlyTarget: number;
  settingsUpdatedAt: number;
  sessions: PomodoroSession[];
  targetChanges: TargetChange[];
  timer: SyncTimer;
}

export function getSyncToken(): string | null {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) return stored;
  }
  return SYNC_TOKEN;
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asSessions(value: unknown): PomodoroSession[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PomodoroSession => {
    if (!item || typeof item !== "object") return false;
    return typeof (item as PomodoroSession).id === "string" && (item as PomodoroSession).id.length > 0;
  });
}

function asChanges(value: unknown): TargetChange[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is TargetChange => {
    if (!item || typeof item !== "object") return false;
    return typeof (item as TargetChange).id === "string" && (item as TargetChange).id.length > 0;
  });
}

function normalizeSessions(sessions: PomodoroSession[]): PomodoroSession[] {
  return sessions
    .map((session) => {
      const next: PomodoroSession = {
        id: session.id,
        startDate: session.startDate,
        endDate: session.endDate,
        plannedSeconds: session.plannedSeconds,
        completed: Boolean(session.completed),
      };
      if (session.deleted) next.deleted = true;
      return next;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function normalizeChanges(changes: TargetChange[]): TargetChange[] {
  return [...changes].sort((a, b) => a.id.localeCompare(b.id));
}

export function toBlob(state: AppState, timer: TimerState): SyncBlob {
  return {
    weeklyTarget: state.weeklyTarget,
    monthlyTarget: state.monthlyTarget,
    yearlyTarget: state.yearlyTarget,
    settingsUpdatedAt: state.settingsUpdatedAt ?? 0,
    sessions: normalizeSessions(state.sessions),
    targetChanges: normalizeChanges(state.targetChanges),
    timer: {
      mode: timer.mode,
      remainingSeconds: timer.remainingSeconds,
      totalSeconds: timer.totalSeconds,
      endAt: timer.endAt ?? null,
      updatedAt: timer.updatedAt ?? 0,
    },
  };
}

export function parseBlob(raw: unknown): SyncBlob {
  if (!raw || typeof raw !== "object") {
    throw new Error("sync payload is not an object");
  }
  const data = raw as Partial<SyncBlob>;
  const timer = data.timer;
  return toBlob(
    {
      weeklyTarget: numberOr(data.weeklyTarget, DEFAULT_WEEKLY_TARGET),
      monthlyTarget: numberOr(data.monthlyTarget, DEFAULT_MONTHLY_TARGET),
      yearlyTarget: numberOr(data.yearlyTarget, DEFAULT_YEARLY_TARGET),
      settingsUpdatedAt: numberOr(data.settingsUpdatedAt, 0),
      sessions: asSessions(data.sessions),
      targetChanges: asChanges(data.targetChanges),
    },
    {
      mode: timer?.mode === "focusing" || timer?.mode === "paused" ? timer.mode : "idle",
      remainingSeconds: numberOr(timer?.remainingSeconds, 0),
      totalSeconds: numberOr(timer?.totalSeconds, 0),
      endAt: typeof timer?.endAt === "number" ? timer.endAt : undefined,
      updatedAt: numberOr(timer?.updatedAt, 0),
    }
  );
}

function mergeSessions(local: PomodoroSession[], remote: PomodoroSession[]): PomodoroSession[] {
  const byId = new Map<string, PomodoroSession>();
  for (const session of [...remote, ...local]) {
    const prev = byId.get(session.id);
    if (!prev) {
      byId.set(session.id, session);
      continue;
    }
    if (session.deleted || prev.deleted) {
      byId.set(session.id, { ...prev, deleted: true });
    }
  }
  return normalizeSessions([...byId.values()]);
}

function mergeChanges(local: TargetChange[], remote: TargetChange[]): TargetChange[] {
  const byId = new Map<string, TargetChange>();
  for (const change of [...remote, ...local]) byId.set(change.id, change);
  return normalizeChanges([...byId.values()]);
}

export function mergeBlobs(local: SyncBlob, remote: SyncBlob): SyncBlob {
  const settings = remote.settingsUpdatedAt > local.settingsUpdatedAt ? remote : local;
  const timer = remote.timer.updatedAt > local.timer.updatedAt ? remote.timer : local.timer;
  return {
    weeklyTarget: settings.weeklyTarget,
    monthlyTarget: settings.monthlyTarget,
    yearlyTarget: settings.yearlyTarget,
    settingsUpdatedAt: settings.settingsUpdatedAt,
    sessions: mergeSessions(local.sessions, remote.sessions),
    targetChanges: mergeChanges(local.targetChanges, remote.targetChanges),
    timer,
  };
}

/** 第一次同步还没有时间戳时盖一个，避免两端用 0 互相覆盖。 */
export function stampBlob(blob: SyncBlob, now = Date.now()): SyncBlob {
  return {
    ...blob,
    settingsUpdatedAt: blob.settingsUpdatedAt > 0 ? blob.settingsUpdatedAt : now,
    timer: {
      ...blob.timer,
      updatedAt: blob.timer.updatedAt > 0 ? blob.timer.updatedAt : now,
    },
  };
}

export function sameTimer(a: SyncTimer, b: SyncTimer): boolean {
  if (a.mode !== b.mode || a.updatedAt !== b.updatedAt || a.totalSeconds !== b.totalSeconds) {
    return false;
  }
  if (a.mode === "focusing") return a.endAt === b.endAt;
  return a.remainingSeconds === b.remainingSeconds && a.endAt === b.endAt;
}

export function sameBlob(a: SyncBlob, b: SyncBlob): boolean {
  return (
    a.weeklyTarget === b.weeklyTarget &&
    a.monthlyTarget === b.monthlyTarget &&
    a.yearlyTarget === b.yearlyTarget &&
    a.settingsUpdatedAt === b.settingsUpdatedAt &&
    sameTimer(a.timer, b.timer) &&
    JSON.stringify(a.sessions) === JSON.stringify(b.sessions) &&
    JSON.stringify(a.targetChanges) === JSON.stringify(b.targetChanges)
  );
}

export function toState(blob: SyncBlob): AppState {
  return {
    weeklyTarget: blob.weeklyTarget,
    monthlyTarget: blob.monthlyTarget,
    yearlyTarget: blob.yearlyTarget,
    settingsUpdatedAt: blob.settingsUpdatedAt,
    sessions: blob.sessions,
    targetChanges: blob.targetChanges,
  };
}

export function toTimer(blob: SyncBlob): TimerState {
  const timer: TimerState = {
    mode: blob.timer.mode,
    remainingSeconds: blob.timer.remainingSeconds,
    totalSeconds: blob.timer.totalSeconds,
    updatedAt: blob.timer.updatedAt,
  };
  if (blob.timer.mode === "focusing" && blob.timer.endAt != null) {
    timer.endAt = blob.timer.endAt;
  }
  return timer;
}

async function authorized(method: "GET" | "PUT", body?: string): Promise<Response> {
  const token = getSyncToken();
  if (!token) throw new Error("missing sync token");
  return fetch(API, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    cache: "no-store",
  });
}

export async function pull(): Promise<SyncBlob> {
  console.info("[sync] pull", API);
  const res = await authorized("GET");
  if (!res.ok) throw new Error(`sync pull failed (${res.status})`);
  return parseBlob(await res.json());
}

export async function push(blob: SyncBlob): Promise<void> {
  const res = await authorized("PUT", JSON.stringify(blob));
  if (!res.ok) throw new Error(`sync push failed (${res.status})`);
}
