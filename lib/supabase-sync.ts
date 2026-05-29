import { AppState } from "./types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/config";

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
  const url = `${restURL(TABLE)}?id=eq.${encodeURIComponent(auth.syncId)}&select=state,updated_at&limit=1`;

  const res = await fetch(url, {
    headers: {
      ...authHeaders(auth),
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
  const body = {
    id: auth.syncId,
    state,
    updated_at: updatedAt.toISOString(),
  };

  const res = await fetch(restURL(TABLE), {
    method: "POST",
    headers: {
      ...authHeaders(auth),
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
    targetChanges: [],
  };
  await uploadState(auth, empty, new Date());
}

export function createSyncAuth(userId: string, accessToken: string): SyncAuth {
  return { syncId: userId, accessToken };
}
