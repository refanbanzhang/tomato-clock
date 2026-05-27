// 删除今天同步数据中最晚的 2 个番茄记录
import { writeFileSync } from "fs";

const SUPABASE_URL = "https://bfgbjtuyojgvcvvxjlxv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Xsb5q3jdp6A15j2XBocwMQ_duzHmILh";
const SYNC_ID = "default";
const TABLE = "tomato_clock_state";
const SWIFT_EPOCH_OFFSET = 978307200;

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

function normalizeStateForWeb(raw) {
  const state = { ...raw };
  if (Array.isArray(state.sessions)) {
    state.sessions = state.sessions.map((s) => ({
      ...s,
      startDate: isSwiftTimeInterval(s.startDate)
        ? swiftTimeIntervalToISO(s.startDate)
        : s.startDate,
      endDate: isSwiftTimeInterval(s.endDate)
        ? swiftTimeIntervalToISO(s.endDate)
        : s.endDate,
    }));
  }
  if (Array.isArray(state.targetChanges)) {
    state.targetChanges = state.targetChanges.map((tc) => ({
      ...tc,
      date: isSwiftTimeInterval(tc.date)
        ? swiftTimeIntervalToISO(tc.date)
        : tc.date,
    }));
  }
  return state;
}

async function main() {
  // 1. Fetch remote state
  console.log("🔍 正在从 Supabase 拉取数据...");
  const fetchUrl = `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(SYNC_ID)}&select=state,updated_at&limit=1`;
  const res = await fetch(fetchUrl, {
    headers: { ...authHeaders(), "Cache-Control": "no-cache", Pragma: "no-cache" },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`拉取失败 (${res.status}):`, await res.text());
    process.exit(1);
  }

  const rows = await res.json();
  if (!rows.length) {
    console.log("⚠️ 远程没有数据。");
    process.exit(0);
  }

  const row = rows[0];
  const state = normalizeStateForWeb(row.state);

  console.log(`📊 共有 ${state.sessions.length} 条番茄记录`);

  // 2. 找到今天的 sessions（按 GMT+8 时区）
  const now = new Date();
  // 今天 00:00:00 GMT+8
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), -8, 0, 0)
  );
  // 明天 00:00:00 GMT+8
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  console.log(`📅 今天 (GMT+8): ${todayStart.toISOString()} ~ ${todayEnd.toISOString()}`);

  const todaySessions = state.sessions
    .map((s, i) => ({ ...s, _originalIndex: i }))
    .filter((s) => {
      const end = new Date(s.endDate);
      return end >= todayStart && end < todayEnd;
    });

  console.log(`📅 今天的番茄记录: ${todaySessions.length} 条`);

  if (todaySessions.length === 0) {
    console.log("⚠️ 今天没有番茄记录，无需删除。");
    process.exit(0);
  }

  // 3. 按 endDate 降序排列，取最晚的 2 条
  todaySessions.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const toDelete = todaySessions.slice(0, 2);
  console.log(`🗑️ 将删除以下 ${toDelete.length} 条记录:`);
  toDelete.forEach((s) => {
    console.log(`  - id: ${s.id}`);
    console.log(`    start: ${s.startDate}`);
    console.log(`    end:   ${s.endDate}`);
    console.log(`    completed: ${s.completed}`);
  });

  // 4. 从原始 sessions 中移除
  const deleteIds = new Set(toDelete.map((s) => s.id));
  const newSessions = state.sessions.filter((s) => !deleteIds.has(s.id));

  console.log(`📊 删除后剩余: ${newSessions.length} 条记录`);

  // 5. 上传
  const updatedAt = new Date();
  const body = {
    id: SYNC_ID,
    state: {
      ...state,
      sessions: newSessions,
    },
    updated_at: updatedAt.toISOString(),
  };

  console.log("☁️ 正在上传到 Supabase...");
  const uploadRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(body),
  });

  if (!uploadRes.ok) {
    console.error(`上传失败 (${uploadRes.status}):`, await uploadRes.text());
    process.exit(1);
  }

  console.log("✅ 删除成功！");
}

main().catch((err) => {
  console.error("❌ 脚本执行出错:", err);
  process.exit(1);
});
