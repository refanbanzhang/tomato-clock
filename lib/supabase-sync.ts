import { AppState, PomodoroSession, TargetChange } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/config";
import { supabase } from "./supabase/client";

const TABLE = "tomato_clock_state";

export interface SyncAuth {
  syncId: string;
  accessToken: string;
}

interface RemoteRow {
  state: AppState;
  updated_at: string;
}

interface RemoteAppState {
  state: AppState;
  updatedAt: Date;
}

function parseSupabaseTimestamp(value: string): Date {
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;

  const d2 = new Date(value.replace(/\.\d+Z$/, "Z"));
  if (!isNaN(d2.getTime())) return d2;

  throw new Error(`Invalid Supabase timestamp: ${value}`);
}

function restURL(path: string): string {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

function authHeaders(auth: SyncAuth): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${auth.accessToken}`,
  };
}

async function resolveSyncAuth(auth: SyncAuth): Promise<SyncAuth> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    console.warn("[sync] getSession failed, using cached token:", error?.message);
    return auth;
  }
  return {
    syncId: data.session.user.id,
    accessToken: data.session.access_token,
  };
}

function latestSessionEnd(state: AppState): number {
  return state.sessions.reduce(
    (max, session) => Math.max(max, new Date(session.endDate).getTime()),
    0
  );
}

export function mergeAppStates(local: AppState, remote: AppState): AppState {
  const sessionsById = new Map<string, PomodoroSession>();
  for (const session of remote.sessions) sessionsById.set(session.id, session);
  for (const session of local.sessions) sessionsById.set(session.id, session);

  const sessions = [...sessionsById.values()].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  const changesById = new Map<string, TargetChange>();
  for (const change of remote.targetChanges) changesById.set(change.id, change);
  for (const change of local.targetChanges) changesById.set(change.id, change);

  const targetChanges = [...changesById.values()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeklyTarget =
    targetChanges.length > 0
      ? targetChanges[targetChanges.length - 1].newValue
      : local.weeklyTarget;

  return {
    sessions,
    weeklyTarget,
    monthlyTarget: local.monthlyTarget ?? remote.monthlyTarget ?? 160,
    yearlyTarget: local.yearlyTarget ?? remote.yearlyTarget ?? 2000,
    targetChanges,
  };
}

export function countLocalOnlySessions(local: AppState, remote: AppState): number {
  const remoteIds = new Set(remote.sessions.map((session) => session.id));
  return local.sessions.filter((session) => !remoteIds.has(session.id)).length;
}

const SWIFT_EPOCH_OFFSET = 978307200;

function swiftTimeIntervalToISO(value: number): string {
  const unixMs = (value + SWIFT_EPOCH_OFFSET) * 1000;
  return new Date(unixMs).toISOString();
}

function isSwiftTimeInterval(value: unknown): value is number {
  return typeof value === "number" && value > 600_000_000;
}

function normalizeStateForWeb(raw: unknown): AppState {
  const state = raw as Record<string, unknown>;

  if (Array.isArray(state.sessions)) {
    state.sessions = state.sessions.map((s: Record<string, unknown>) => {
      if (isSwiftTimeInterval(s.startDate)) {
        s.startDate = swiftTimeIntervalToISO(s.startDate as number);
      }
      if (isSwiftTimeInterval(s.endDate)) {
        s.endDate = swiftTimeIntervalToISO(s.endDate as number);
      }
      return s;
    });
  }

  if (Array.isArray(state.targetChanges)) {
    state.targetChanges = (state.targetChanges as Record<string, unknown>[]).map((tc) => {
      if (isSwiftTimeInterval(tc.date)) {
        tc.date = swiftTimeIntervalToISO(tc.date as number);
      }
      return tc;
    });
  }

  return state as unknown as AppState;
}

export async function fetchRemoteState(auth: SyncAuth): Promise<RemoteAppState | null> {
  const freshAuth = await resolveSyncAuth(auth);
  const url = `${restURL(TABLE)}?id=eq.${encodeURIComponent(freshAuth.syncId)}&select=state,updated_at&limit=1`;

  const res = await fetch(url, {
    headers: {
      ...authHeaders(freshAuth),
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase fetch failed (${res.status}): ${body}`);
  }

  const rows: RemoteRow[] = await res.json();
  if (!rows.length) return null;

  const row = rows[0];
  return {
    state: normalizeStateForWeb(row.state),
    updatedAt: parseSupabaseTimestamp(row.updated_at),
  };
}

export async function uploadState(
  auth: SyncAuth,
  state: AppState,
  updatedAt: Date
): Promise<void> {
  const freshAuth = await resolveSyncAuth(auth);
  const body = {
    id: freshAuth.syncId,
    state,
    updated_at: updatedAt.toISOString(),
  };

  console.info("[sync] upload", {
    syncId: freshAuth.syncId,
    sessionCount: state.sessions.length,
    latestSessionEnd: latestSessionEnd(state)
      ? new Date(latestSessionEnd(state)).toISOString()
      : null,
    updatedAt: updatedAt.toISOString(),
  });

  const res = await fetch(restURL(TABLE), {
    method: "POST",
    headers: {
      ...authHeaders(freshAuth),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upload failed (${res.status}): ${text}`);
  }
}

export async function clearRemoteState(auth: SyncAuth): Promise<void> {
  const empty: AppState = {
    sessions: [],
    weeklyTarget: 40,
    monthlyTarget: 160,
    yearlyTarget: 2000,
    targetChanges: [],
  };
  await uploadState(auth, empty, new Date());
}

export function createSyncAuth(userId: string, accessToken: string): SyncAuth {
  return { syncId: userId, accessToken };
}
