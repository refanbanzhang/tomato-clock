import { keepSessions, mergeTags, unionTags } from "./store";
import { PomodoroSession, TagEntry } from "./types";

export interface SyncState {
  sessions: PomodoroSession[];
  tags: TagEntry[];
}

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
  getState: () => SyncState,
  apply: (next: SyncState) => void,
): Promise<void> {
  const run = tail.then(() => syncLoop(getState, apply));
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function syncLoop(
  getState: () => SyncState,
  apply: (next: SyncState) => void,
): Promise<void> {
  for (let attempt = 0; attempt < MAX_TRIES; attempt += 1) {
    const remote = await pull();
    const local = getState();
    const merged = combine(local, remote);
    if (!sameState(merged, local)) apply(merged);
    const latest = getState();
    if (settled(latest, remote)) return;
    const written = await push(latest, remote.etag);
    if (written === "conflict") continue;
    if (written === "stripped") return;
    if (sameState(getState(), latest)) return;
  }
  throw new Error("sync did not converge");
}

function combine(local: SyncState, remote: { sessions: PomodoroSession[]; tags: TagEntry[] | null }): SyncState {
  const sessions = mergeSessions(local.sessions, remote.sessions);
  const tags = unionTags(remote.tags == null ? local.tags : mergeTags(local.tags, remote.tags), sessions);
  return { sessions, tags };
}

function settled(local: SyncState, remote: { sessions: PomodoroSession[]; tags: TagEntry[] | null }): boolean {
  if (!sameSessions(local.sessions, remote.sessions)) return false;
  if (remote.tags == null) return local.tags.length === 0;
  return sameTags(local.tags, remote.tags);
}

async function pull(): Promise<{ etag: string; sessions: PomodoroSession[]; tags: TagEntry[] | null }> {
  console.info("[sync] pull", SYNC_API);
  const res = await fetch(SYNC_API, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`sync pull failed (${res.status})`);
  const etag = quotedEtag(res.headers.get("ETag"));
  return { etag, ...parsePayload(await res.json()) };
}

async function push(
  state: SyncState,
  etag: string,
): Promise<"ok" | "conflict" | "stripped"> {
  const res = await fetch(SYNC_API, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "If-Match": etag,
    },
    body: JSON.stringify({ sessions: state.sessions, tags: canonTags(state.tags) }),
  });
  if (res.status === 412) return "conflict";
  if (!res.ok) throw new Error(`sync push failed (${res.status})`);
  const stored = parsePayload(await res.json());
  console.info("[sync] push", { sessions: state.sessions.length, tags: state.tags.length });
  return kept(state, stored) ? "ok" : "stripped";
}

function kept(sent: SyncState, stored: { sessions: PomodoroSession[]; tags: TagEntry[] | null }): boolean {
  const byId = new Map(stored.sessions.map((session) => [session.id, session.tag ?? ""]));
  const sessionsOk = sent.sessions.every((session) => (session.tag ?? "") === (byId.get(session.id) ?? ""));
  if (!sessionsOk) return false;
  if (stored.tags == null) return sent.tags.length === 0;
  return sameTags(sent.tags, stored.tags);
}

function quotedEtag(etag: string | null): string {
  if (!etag) throw new Error("sync pull missing etag");
  const value = etag.trim().replace(/^W\//i, "");
  if (!value.startsWith('"') || !value.endsWith('"')) throw new Error("sync etag is invalid");
  return value;
}

function parsePayload(value: unknown): { sessions: PomodoroSession[]; tags: TagEntry[] | null } {
  if (!value || typeof value !== "object" || !Array.isArray((value as { sessions?: unknown }).sessions)) {
    throw new Error("sync payload has no sessions");
  }
  const record = value as { sessions: PomodoroSession[]; tags?: unknown };
  const tags = Object.prototype.hasOwnProperty.call(record, "tags") ? parseTags(record.tags) : null;
  return { sessions: mergeSessions(record.sessions, []), tags };
}

function parseTags(value: unknown): TagEntry[] {
  if (!Array.isArray(value)) throw new Error("sync payload tags are invalid");
  const tags: TagEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") throw new Error("sync payload tags are invalid");
    const record = item as { name?: unknown; at?: unknown; off?: unknown };
    if (typeof record.name !== "string" || record.name.length === 0 || record.name.length > 16) {
      throw new Error("sync payload tags are invalid");
    }
    if (typeof record.at !== "number" || !Number.isInteger(record.at) || record.at < 1) {
      throw new Error("sync payload tags are invalid");
    }
    tags.push(record.off === true ? { name: record.name, at: record.at, off: true } : { name: record.name, at: record.at });
  }
  return mergeTags([], tags);
}

function canonTags(tags: TagEntry[]): TagEntry[] {
  return [...tags].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function sameTags(a: TagEntry[], b: TagEntry[]): boolean {
  const left = canonTags(a);
  const right = canonTags(b);
  if (left.length !== right.length) return false;
  return left.every((item, index) => {
    const other = right[index];
    return item.name === other?.name && item.at === other.at && Boolean(item.off) === Boolean(other.off);
  });
}

function sameState(a: SyncState, b: SyncState): boolean {
  return sameSessions(a.sessions, b.sessions) && sameTags(a.tags, b.tags);
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
