/**
 * 将旧版 Mac/Swift 应用 syncId=default 的云端数据合并到指定用户账号。
 * 用法: node scripts/merge-default-sync.mjs <userId>
 */
import { readFileSync } from "fs";

const SUPABASE_URL = "https://bfgbjtuyojgvcvvxjlxv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Xsb5q3jdp6A15j2XBocwMQ_duzHmILh";
const TABLE = "tomato_clock_state";
const LEGACY_SYNC_ID = "default";
const SWIFT_EPOCH_OFFSET = 978307200;

const userId = process.argv[2];
if (!userId) {
  console.error("用法: node scripts/merge-default-sync.mjs <userId>");
  process.exit(1);
}

function authHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

function swiftTimeIntervalToISO(value) {
  const unixMs = (value + SWIFT_EPOCH_OFFSET) * 1000;
  return new Date(unixMs).toISOString();
}

function isSwiftTimeInterval(value) {
  return typeof value === "number" && value > 600_000_000;
}

function normalizeState(raw) {
  const state = structuredClone(raw);
  if (Array.isArray(state.sessions)) {
    state.sessions = state.sessions.map((session) => {
      const next = { ...session };
      if (isSwiftTimeInterval(next.startDate)) {
        next.startDate = swiftTimeIntervalToISO(next.startDate);
      }
      if (isSwiftTimeInterval(next.endDate)) {
        next.endDate = swiftTimeIntervalToISO(next.endDate);
      }
      return next;
    });
  }
  if (Array.isArray(state.targetChanges)) {
    state.targetChanges = state.targetChanges.map((change) => {
      const next = { ...change };
      if (isSwiftTimeInterval(next.date)) {
        next.date = swiftTimeIntervalToISO(next.date);
      }
      return next;
    });
  }
  return state;
}

function mergeStates(local, remote) {
  const sessionsById = new Map();
  for (const session of remote.sessions ?? []) sessionsById.set(session.id, session);
  for (const session of local.sessions ?? []) sessionsById.set(session.id, session);

  const sessions = [...sessionsById.values()].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  const changesById = new Map();
  for (const change of remote.targetChanges ?? []) changesById.set(change.id, change);
  for (const change of local.targetChanges ?? []) changesById.set(change.id, change);

  const targetChanges = [...changesById.values()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const weeklyTarget =
    targetChanges.length > 0
      ? targetChanges[targetChanges.length - 1].newValue
      : local.weeklyTarget ?? remote.weeklyTarget ?? 40;

  return { sessions, weeklyTarget, targetChanges };
}

async function fetchState(syncId) {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(syncId)}&select=state,updated_at&limit=1`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`fetch ${syncId} failed (${res.status}): ${await res.text()}`);
  const rows = await res.json();
  if (!rows.length) return null;
  return {
    state: normalizeState(rows[0].state),
    updatedAt: rows[0].updated_at,
  };
}

async function uploadState(syncId, state) {
  const body = {
    id: syncId,
    state,
    updated_at: new Date().toISOString(),
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`upload ${syncId} failed (${res.status}): ${await res.text()}`);
}

async function main() {
  const [legacy, user] = await Promise.all([
    fetchState(LEGACY_SYNC_ID),
    fetchState(userId),
  ]);

  if (!legacy) {
    console.log(`legacy 桶 "${LEGACY_SYNC_ID}" 不存在，无需合并`);
    return;
  }

  const local = user?.state ?? {
    sessions: [],
    weeklyTarget: 40,
    targetChanges: [],
  };
  const merged = mergeStates(local, legacy.state);
  const legacyOnly = legacy.state.sessions.filter(
    (session) => !local.sessions.some((item) => item.id === session.id)
  ).length;

  console.log("合并预览:", {
    userId,
    legacyCount: legacy.state.sessions.length,
    userCount: local.sessions.length,
    mergedCount: merged.sessions.length,
    legacyOnly,
  });

  if (legacyOnly === 0) {
    console.log("legacy 数据已全部包含在用户账号中，跳过上传。");
    return;
  }

  await uploadState(userId, merged);
  console.log(`已合并 ${legacyOnly} 条 legacy 独有记录到 ${userId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
