const MAX_BODY = 1_000_000;
const MAX_SESSIONS = 10_000;
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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
    try {
      const url = new URL(request.url);
      if (url.pathname !== "/") throw new HttpError(404, "not found");
      if (request.method === "GET") return await read(env, "only");
      if (request.method === "PUT") return await write(env, "only", request);
      throw new HttpError(405, "method not allowed");
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) console.error("[sync]", error);
      return json({ error: status === 500 ? "sync failed" : error.message }, status);
    }
  },
};

async function read(env, key) {
  const snapshot = await load(env, key);
  return json({ sessions: snapshot.sessions, tags: snapshot.tags }, 200, quote(String(snapshot.rev)));
}

async function write(env, key, request) {
  const match = ifMatch(request);
  const expected = Number(match);
  if (!Number.isInteger(expected) || expected < 0) throw new HttpError(400, "bad If-Match");
  const incoming = await readBody(request);
  const sessions = normalize(incoming.sessions);

  if (expected === 0) {
    const tags = incoming.tags == null ? [] : normalizeTags(incoming.tags);
    const body = JSON.stringify({ sessions, tags });
    const inserted = await env.DB.prepare(
      "INSERT INTO blobs (key, rev, body) VALUES (?, 1, ?) ON CONFLICT(key) DO NOTHING",
    )
      .bind(key, body)
      .run();
    if (inserted.meta.changes !== 1) return conflict(await load(env, key));
    return json({ sessions, tags }, 200, quote("1"));
  }

  const existing = await load(env, key);
  if (existing.rev !== expected) return conflict(existing);
  const tags = incoming.tags == null ? existing.tags : normalizeTags(incoming.tags);
  const body = JSON.stringify({ sessions, tags });
  if (
    JSON.stringify(existing.sessions) === JSON.stringify(sessions) &&
    JSON.stringify(existing.tags) === JSON.stringify(tags)
  ) {
    return json({ sessions: existing.sessions, tags: existing.tags }, 200, quote(String(existing.rev)));
  }
  const updated = await env.DB.prepare("UPDATE blobs SET rev = rev + 1, body = ? WHERE key = ? AND rev = ?")
    .bind(body, key, expected)
    .run();
  if (updated.meta.changes !== 1) return conflict(await load(env, key));
  return json({ sessions, tags }, 200, quote(String(expected + 1)));
}

async function load(env, key) {
  const row = await env.DB.prepare("SELECT rev, body FROM blobs WHERE key = ?").bind(key).first();
  if (!row) return { rev: 0, sessions: [], tags: [] };
  const parsed = JSON.parse(row.body);
  const tags = parsed && Object.prototype.hasOwnProperty.call(parsed, "tags") ? normalizeTags(parsed.tags) : [];
  return { rev: row.rev, sessions: normalize(parsed.sessions), tags };
}

function ifMatch(request) {
  const raw = request.headers.get("If-Match");
  if (!raw) throw new HttpError(428, "If-Match required");
  const value = raw.trim().replace(/^W\//i, "");
  if (!value.startsWith('"') || !value.endsWith('"') || value.includes(",")) {
    throw new HttpError(400, "bad If-Match");
  }
  return value.slice(1, -1);
}

async function readBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) throw new HttpError(413, "sync body too large");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new HttpError(400, "sync body is not json");
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.sessions)) {
    throw new HttpError(400, "sync body has no sessions");
  }
  if (parsed.sessions.length > MAX_SESSIONS) throw new HttpError(413, "too many sessions");
  if (!Object.prototype.hasOwnProperty.call(parsed, "tags")) return { sessions: parsed.sessions, tags: null };
  if (!Array.isArray(parsed.tags)) throw new HttpError(400, "sync body tags must be an array");
  if (parsed.tags.length > 100) throw new HttpError(413, "too many tags");
  return { sessions: parsed.sessions, tags: parsed.tags };
}

function normalizeTags(value) {
  if (!Array.isArray(value)) throw new HttpError(400, "tags must be an array");
  const byName = new Map();
  for (const item of value) {
    const next = tagEntry(item);
    const prev = byName.get(next.name);
    if (!prev || next.at > prev.at) byName.set(next.name, next);
  }
  return [...byName.values()].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function tagEntry(item) {
  if (!item || typeof item !== "object") throw new HttpError(400, "bad tag");
  const name = item.name;
  if (typeof name !== "string" || name.length === 0 || name !== name.trim() || name.length > 16) {
    throw new HttpError(400, "bad tag name");
  }
  if (typeof item.at !== "number" || !Number.isInteger(item.at) || item.at < 1 || item.at > 1e13) {
    throw new HttpError(400, "bad tag time");
  }
  const row = { name, at: item.at };
  if (item.off === true) row.off = true;
  return row;
}

function normalize(value) {
  if (!Array.isArray(value)) throw new HttpError(400, "sessions must be an array");
  if (value.length > MAX_SESSIONS) throw new HttpError(413, "too many sessions");
  const byId = new Map();
  for (const item of value) {
    const next = session(item);
    if (DROPPED_SESSION_IDS.has(next.id)) continue;
    byId.set(next.id, keep(byId.get(next.id), next));
  }
  return [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function session(item) {
  if (!item || typeof item !== "object") throw new HttpError(400, "bad session");
  const { id, startDate, endDate, plannedSeconds } = item;
  if (typeof id !== "string" || id.length === 0 || id.length > 80) throw new HttpError(400, "bad session id");
  if (typeof startDate !== "string" || startDate.length < 10 || startDate.length > 40) {
    throw new HttpError(400, "bad session start");
  }
  if (typeof endDate !== "string" || endDate.length < 10 || endDate.length > 40) {
    throw new HttpError(400, "bad session end");
  }
  if (
    typeof plannedSeconds !== "number" ||
    !Number.isInteger(plannedSeconds) ||
    plannedSeconds < 1 ||
    plannedSeconds > 86400
  ) {
    throw new HttpError(400, "bad session length");
  }
  const row = { id, startDate, endDate, plannedSeconds };
  if (item.tag != null && item.tag !== "") {
    if (typeof item.tag !== "string" || item.tag !== item.tag.trim() || item.tag.length > 16) {
      throw new HttpError(400, "bad session tag");
    }
    row.tag = item.tag;
  }
  if (item.tagAt != null && item.tagAt !== "") {
    if (typeof item.tagAt !== "number" || !Number.isInteger(item.tagAt) || item.tagAt < 1 || item.tagAt > 1e13) {
      throw new HttpError(400, "bad session tag time");
    }
    row.tagAt = item.tagAt;
  }
  return row;
}

function stamp(base, from) {
  const row = {
    id: base.id,
    startDate: base.startDate,
    endDate: base.endDate,
    plannedSeconds: base.plannedSeconds,
  };
  if (from.tag) row.tag = from.tag;
  if (from.tagAt) row.tagAt = from.tagAt;
  return row;
}

function keep(prev, next) {
  if (!prev) return next;
  if (prev.startDate !== next.startDate || prev.endDate !== next.endDate || prev.plannedSeconds !== next.plannedSeconds) {
    throw new HttpError(409, "session conflict");
  }
  const prevAt = prev.tagAt || 0;
  const nextAt = next.tagAt || 0;
  if (nextAt > prevAt) return stamp(prev, next);
  if (prevAt > nextAt) return prev;
  if ((prev.tag || "") === (next.tag || "")) return prev;
  if (!prev.tag && next.tag) return stamp(prev, next);
  return prev;
}

function conflict(snapshot) {
  return json({ sessions: snapshot.sessions, tags: snapshot.tags }, 412, quote(String(snapshot.rev)));
}

function quote(etag) {
  return etag.startsWith('"') ? etag : `"${etag}"`;
}

function json(body, status, etag) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "ETag",
    "cache-control": "no-store",
  };
  if (etag) headers.etag = etag;
  return new Response(JSON.stringify(body), { status, headers });
}

function cors(response) {
  response.headers.set("access-control-allow-origin", "*");
  response.headers.set("access-control-allow-methods", "GET, PUT, OPTIONS");
  response.headers.set("access-control-allow-headers", "Content-Type, If-Match");
  response.headers.set("access-control-expose-headers", "ETag");
  response.headers.set("access-control-max-age", "86400");
  return response;
}
