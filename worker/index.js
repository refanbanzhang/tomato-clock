const MAX_BODY = 1_000_000;
const MAX_SESSIONS = 10_000;

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
  return json({ sessions: snapshot.sessions }, 200, quote(String(snapshot.rev)));
}

async function write(env, key, request) {
  const match = ifMatch(request);
  const expected = Number(match);
  if (!Number.isInteger(expected) || expected < 0) throw new HttpError(400, "bad If-Match");
  const sessions = normalize(await readBody(request));
  const body = JSON.stringify({ sessions });

  if (expected === 0) {
    const inserted = await env.DB.prepare(
      "INSERT INTO blobs (key, rev, body) VALUES (?, 1, ?) ON CONFLICT(key) DO NOTHING",
    )
      .bind(key, body)
      .run();
    if (inserted.meta.changes !== 1) return conflict(await load(env, key));
    return json({ sessions }, 200, quote("1"));
  }

  const existing = await load(env, key);
  if (existing.rev !== expected) return conflict(existing);
  if (JSON.stringify(existing.sessions) === JSON.stringify(sessions)) {
    return json({ sessions: existing.sessions }, 200, quote(String(existing.rev)));
  }
  const updated = await env.DB.prepare("UPDATE blobs SET rev = rev + 1, body = ? WHERE key = ? AND rev = ?")
    .bind(body, key, expected)
    .run();
  if (updated.meta.changes !== 1) return conflict(await load(env, key));
  return json({ sessions }, 200, quote(String(expected + 1)));
}

async function load(env, key) {
  const row = await env.DB.prepare("SELECT rev, body FROM blobs WHERE key = ?").bind(key).first();
  if (!row) return { rev: 0, sessions: [] };
  const parsed = JSON.parse(row.body);
  return { rev: row.rev, sessions: normalize(parsed.sessions) };
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
  return parsed.sessions;
}

function normalize(value) {
  if (!Array.isArray(value)) throw new HttpError(400, "sessions must be an array");
  if (value.length > MAX_SESSIONS) throw new HttpError(413, "too many sessions");
  const byId = new Map();
  for (const item of value) {
    const next = session(item);
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
  return { id, startDate, endDate, plannedSeconds };
}

function keep(prev, next) {
  if (!prev) return next;
  if (prev.startDate !== next.startDate || prev.endDate !== next.endDate || prev.plannedSeconds !== next.plannedSeconds) {
    throw new HttpError(409, "session conflict");
  }
  return prev;
}

function conflict(snapshot) {
  return json({ sessions: snapshot.sessions }, 412, quote(String(snapshot.rev)));
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
