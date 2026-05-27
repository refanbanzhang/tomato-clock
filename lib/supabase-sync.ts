import { AppState } from "./types";

const SUPABASE_URL = "https://bfgbjtuyojgvcvvxjlxv.supabase.co";
const SUPABASE_ANON_KEY =
  "sb_publishable_Xsb5q3jdp6A15j2XBocwMQ_duzHmILh";
const SYNC_ID = "default";
const TABLE = "tomato_clock_state";

interface RemoteRow {
  state: AppState;
  updated_at: string;
}

interface RemoteAppState {
  state: AppState;
  updatedAt: Date;
}

function parseSupabaseTimestamp(value: string): Date {
  // Try ISO 8601 with fractional seconds first
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;

  // Fallback: try without fractional seconds
  const d2 = new Date(value.replace(/\.\d+Z$/, "Z"));
  if (!isNaN(d2.getTime())) return d2;

  throw new Error(`Invalid Supabase timestamp: ${value}`);
}

function restURL(path: string): string {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

function authHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

/**
 * Swift stores Date as TimeInterval (seconds since 2001-01-01 UTC),
 * which JSON-encodes as a number. Web expects ISO 8601 strings.
 * Convert numeric dates to ISO strings when pulling from Supabase.
 */
const SWIFT_EPOCH_OFFSET = 978307200; // seconds between 1970-01-01 and 2001-01-01

function swiftTimeIntervalToISO(value: number): string {
  const unixMs = (value + SWIFT_EPOCH_OFFSET) * 1000;
  return new Date(unixMs).toISOString();
}

function isSwiftTimeInterval(value: unknown): value is number {
  // Swift TimeIntervals are typically > 600_000_000 (year ~2000+)
  return typeof value === "number" && value > 600_000_000;
}

function normalizeStateForWeb(raw: unknown): AppState {
  const state = raw as Record<string, unknown>;

  // Normalize sessions: convert numeric dates to ISO strings
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

  // Normalize targetChanges: convert numeric dates to ISO strings
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

export async function fetchRemoteState(): Promise<RemoteAppState | null> {
  const url = `${restURL(TABLE)}?id=eq.${encodeURIComponent(SYNC_ID)}&select=state,updated_at&limit=1`;

  const res = await fetch(url, {
    headers: {
      ...authHeaders(),
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
  state: AppState,
  updatedAt: Date
): Promise<void> {
  const body = {
    id: SYNC_ID,
    state,
    updated_at: updatedAt.toISOString(),
  };

  const res = await fetch(restURL(TABLE), {
    method: "POST",
    headers: {
      ...authHeaders(),
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

export async function clearRemoteState(): Promise<void> {
  const empty: AppState = {
    sessions: [],
    weeklyTarget: 40,
    targetChanges: [],
  };
  await uploadState(empty, new Date());
}
