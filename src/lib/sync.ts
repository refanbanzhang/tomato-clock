import { keepSessions } from "./store";
import { PomodoroSession } from "./types";

const MAX_TRIES = 8;

export const SYNC_API = "https://tomato-sync.nevergiveuppiano.workers.dev";

export function mergeSessions(local: PomodoroSession[], remote: PomodoroSession[]): PomodoroSession[] {
  const byId = new Map<string, PomodoroSession>();
  for (const session of keepSessions([...remote, ...local])) {
    const next = sessionOf(session);
    const prev = byId.get(next.id);
    if (!prev) {
      byId.set(next.id, next);
      continue;
    }
    if (
      prev.startDate !== next.startDate ||
      prev.endDate !== next.endDate ||
      prev.plannedSeconds !== next.plannedSeconds
    ) {
      throw new Error(`session ${next.id} conflict`);
    }
    byId.set(next.id, preferTag(prev, next));
  }
  return [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

let tail: Promise<void> = Promise.resolve();

export function scheduleSync(
  getSessions: () => PomodoroSession[],
  apply: (sessions: PomodoroSession[]) => void,
): Promise<void> {
  const run = tail.then(() => syncLoop(getSessions, apply));
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function syncLoop(
  getSessions: () => PomodoroSession[],
  apply: (sessions: PomodoroSession[]) => void,
): Promise<void> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt += 1) {
    const remote = await pull();
    const merged = mergeSessions(getSessions(), remote.sessions);
    if (!sameSessions(merged, getSessions())) apply(merged);
    const latest = mergeSessions(getSessions(), []);
    if (sameSessions(latest, remote.sessions)) return;
    const written = await push(latest, remote.etag);
    if (written === "conflict") continue;
    if (written === "stripped") return;
    if (sameSessions(mergeSessions(getSessions(), []), latest)) return;
  }
  throw new Error("sync did not converge");
}

async function pull(): Promise<{ etag: string; sessions: PomodoroSession[] }> {
  console.info("[sync] pull", SYNC_API);
  const res = await fetch(SYNC_API, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`sync pull failed (${res.status})`);
  const etag = quotedEtag(res.headers.get("ETag"));
  return { etag, sessions: parseSessions(await res.json()) };
}

async function push(
  sessions: PomodoroSession[],
  etag: string,
): Promise<"ok" | "conflict" | "stripped"> {
  const res = await fetch(SYNC_API, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "If-Match": etag,
    },
    body: JSON.stringify({ sessions }),
  });
  if (res.status === 412) return "conflict";
  if (!res.ok) throw new Error(`sync push failed (${res.status})`);
  const stored = parseSessions(await res.json());
  console.info("[sync] push", { sessions: sessions.length });
  return tagsKept(sessions, stored) ? "ok" : "stripped";
}

function tagsKept(sent: PomodoroSession[], stored: PomodoroSession[]): boolean {
  const byId = new Map(stored.map((session) => [session.id, session.tag ?? ""]));
  return sent.every((session) => (session.tag ?? "") === (byId.get(session.id) ?? ""));
}

function quotedEtag(etag: string | null): string {
  if (!etag) throw new Error("sync pull missing etag");
  const value = etag.trim().replace(/^W\//i, "");
  if (!value.startsWith('"') || !value.endsWith('"')) throw new Error("sync etag is invalid");
  return value;
}

function parseSessions(value: unknown): PomodoroSession[] {
  if (!value || typeof value !== "object" || !Array.isArray((value as { sessions?: unknown }).sessions)) {
    throw new Error("sync payload has no sessions");
  }
  return mergeSessions((value as { sessions: PomodoroSession[] }).sessions, []);
}

function sessionOf(session: PomodoroSession): PomodoroSession {
  if (!session || typeof session.id !== "string" || session.id.length === 0) {
    throw new Error("bad session");
  }
  const next: PomodoroSession = {
    id: session.id,
    startDate: session.startDate,
    endDate: session.endDate,
    plannedSeconds: session.plannedSeconds,
  };
  if (typeof session.tag === "string" && session.tag.length > 0 && session.tag.length <= 16) {
    next.tag = session.tag;
  }
  if (typeof session.tagAt === "number" && Number.isInteger(session.tagAt) && session.tagAt > 0) {
    next.tagAt = session.tagAt;
  }
  return next;
}

function preferTag(prev: PomodoroSession, next: PomodoroSession): PomodoroSession {
  const prevAt = prev.tagAt ?? 0;
  const nextAt = next.tagAt ?? 0;
  if (nextAt > prevAt) return carryTag(prev, next);
  if (prevAt > nextAt) return prev;
  if ((prev.tag ?? "") === (next.tag ?? "")) return prev;
  if (!prev.tag && next.tag) return carryTag(prev, next);
  return prev;
}

function carryTag(base: PomodoroSession, from: PomodoroSession): PomodoroSession {
  const next: PomodoroSession = {
    id: base.id,
    startDate: base.startDate,
    endDate: base.endDate,
    plannedSeconds: base.plannedSeconds,
  };
  if (from.tag) next.tag = from.tag;
  if (from.tagAt) next.tagAt = from.tagAt;
  return next;
}

function sameSessions(a: PomodoroSession[], b: PomodoroSession[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((session, index) => {
    const other = b[index];
    return session.id === other?.id && (session.tag ?? "") === (other?.tag ?? "");
  });
}
