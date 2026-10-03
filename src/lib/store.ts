import { AppState, PomodoroSession } from "./types";

const TAG_MAX = 16;

const STORAGE_KEY = "tomato-clock";
const OBSOLETE_KEYS = ["tomato-clock-state:preview", "token", "tomato-clock-sync-token"];

const DROPPED_SESSION_IDS = new Set([
  "18ee64be-17a0-4250-8721-81eab5890e2d",
  "349a5014-bfc1-49e2-915d-33a19414ece1",
  "36dbde7a-f785-4f8d-bd55-470a0f4b25de",
  "47a5ad0c-021f-4d01-a93d-137639a5a84e",
  "7ef67ce2-05b1-435b-a2bf-016f683eca26",
  "8a626f42-087b-4335-9952-0b89d2bfcf8b",
  "8e86769c-7692-4037-93d0-d50c964eb0f8",
  "93bdd38e-b519-4bac-b399-d325320ac3fe",
  "a3180f08-fc74-4d79-9c08-dc614710c588",
  "a7e1cdf6-c7cb-450c-9907-c31ec9071b47",
  "aa058adc-b3f2-4066-af6b-2c38b9a63f7a",
  "b4c9d599-2ce9-4bd4-a756-0670598c8c62",
  "ca06ec7d-931d-43ac-880b-04738e81762b",
  "cdada8ef-4e99-4e4f-b32d-514df3ea58d9",
  "db652e1c-91b9-4803-a191-3a64991aed54",
  "ddee1fc3-c85e-42ce-99a0-6b7b48daf1f2",
  "fc5a57c3-bce6-4221-8f8f-291197236622",
  "fdfec062-55ec-46c7-a071-79029ac24ee8",
  "6a2f6534-409e-4d08-9959-7abd906c4a3d",
]);

export function keepSessions(sessions: PomodoroSession[]): PomodoroSession[] {
  return sessions.filter((session) => !DROPPED_SESSION_IDS.has(session.id));
}

export function cleanTag(value: string): string {
  const tag = value.trim().replace(/\s+/g, " ");
  if (!tag) throw new Error("标签不能为空");
  if (tag.length > TAG_MAX) throw new Error("标签最多 16 个字");
  return tag;
}

function readTag(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    return cleanTag(value);
  } catch {
    return undefined;
  }
}

export function unionTags(tags: string[], sessions: PomodoroSession[]): string[] {
  const next = [...tags];
  for (const session of sessions) {
    if (session.tag && !next.includes(session.tag)) next.push(session.tag);
  }
  return next;
}

function tagList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags: string[] = [];
  for (const item of value) {
    const tag = readTag(item);
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function readTagAt(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 1e13) return undefined;
  return value;
}

function normalizeSession(session: PomodoroSession): PomodoroSession {
  if (!session || typeof session !== "object") return session;
  const tag = readTag(session.tag);
  const tagAt = readTagAt(session.tagAt);
  const next: PomodoroSession = {
    id: session.id,
    startDate: session.startDate,
    endDate: session.endDate,
    plannedSeconds: session.plannedSeconds,
  };
  if (tag) next.tag = tag;
  if (tagAt) next.tagAt = tagAt;
  return next;
}

function emptyState(): AppState {
  return { sessions: [], tags: [] };
}

function parseStoredState(raw: string): AppState {
  const parsed = JSON.parse(raw) as AppState;
  if (!parsed || !Array.isArray(parsed.sessions)) {
    throw new Error("invalid tomato clock data");
  }
  const sessions = keepSessions(parsed.sessions).map(normalizeSession);
  const tags = unionTags(tagList(parsed.tags), sessions);
  const currentTag = readTag(parsed.currentTag);
  return {
    sessions,
    tags,
    currentTag: currentTag && tags.includes(currentTag) ? currentTag : undefined,
  };
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

export function addTag(state: AppState, name: string): AppState {
  const tag = cleanTag(name);
  if (state.tags.includes(tag)) return { ...state, currentTag: tag };
  return { ...state, tags: [...state.tags, tag], currentTag: tag };
}

export function selectTag(state: AppState, name: string): AppState {
  if (!state.tags.includes(name)) throw new Error("标签不存在");
  return { ...state, currentTag: name };
}

export function setSessionTag(state: AppState, id: string, name: string): AppState {
  const tag = name ? cleanTag(name) : undefined;
  if (tag && !state.tags.includes(tag)) throw new Error("标签不存在");
  let found = false;
  const sessions = state.sessions.map((session) => {
    if (session.id !== id) return session;
    found = true;
    if ((session.tag ?? "") === (tag ?? "")) return session;
    const tagAt = Date.now();
    if (!tag) {
      const { tag: _omit, ...rest } = session;
      return { ...rest, tagAt };
    }
    return { ...session, tag, tagAt };
  });
  if (!found) throw new Error("记录不存在");
  return { ...state, sessions };
}

export function removeTag(state: AppState, name: string): AppState {
  if (state.sessions.some((session) => session.tag === name)) {
    throw new Error("这个标签已有记录");
  }
  return {
    ...state,
    tags: state.tags.filter((tag) => tag !== name),
    currentTag: state.currentTag === name ? undefined : state.currentTag,
  };
}
