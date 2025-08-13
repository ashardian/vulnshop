export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Parse origins from env
    const allowedPublic = env.ALLOWED_ORIGIN_PUBLIC?.split(",") || [];
    const allowedAdmin = env.ALLOWED_ORIGIN_ADMIN?.split(",") || [];

    // Handle preflight CORS
    if (request.method === "OPTIONS") {
      return handleOptions(request, allowedPublic, allowedAdmin);
    }

    // Routing
    if (url.pathname === "/log" && request.method === "POST") {
      return handleLog(request, env, allowedPublic);
    }

    if (url.pathname === "/upload" && request.method === "POST") {
      return handleUpload(request, env, allowedPublic);
    }

    if (url.pathname === "/events" && request.method === "GET") {
      return requireAuth(request, env, async () => {
        return handleEvents(env, allowedAdmin);
      });
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      return requireAuth(request, env, async () => {
        return handleStats(env, allowedAdmin);
      });
    }

    return new Response("Not found", { status: 404 });
  }
};

// ===== Helper: CORS Preflight =====
function handleOptions(request, allowedPublic, allowedAdmin) {
  const origin = request.headers.get("Origin");
  if (origin && (allowedPublic.includes(origin) || allowedAdmin.includes(origin))) {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  return new Response(null, { status: 204 });
}

// ===== Auth for Admin Endpoints =====
function requireAuth(request, env, callback) {
  const auth = request.headers.get("Authorization") || "";
  const expected = "Basic " + btoa(`${env.ADMIN_USER}:${env.ADMIN_PASS}`);
  if (auth === expected) {
    return callback();
  }
  return new Response("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' }
  });
}

// ===== Handle /log =====
async function handleLog(request, env, allowedPublic) {
  const origin = request.headers.get("Origin");
  if (!allowedPublic.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const data = await request.json();
    const timestamp = new Date().toISOString();
    const key = `log:${timestamp}:${crypto.randomUUID()}`;
    await env.HONEYPOT_KV.put(key, JSON.stringify(data));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}

// ===== Handle /upload =====
async function handleUpload(request, env, allowedPublic) {
  const origin = request.headers.get("Origin");
  if (!allowedPublic.includes(origin)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) throw new Error("No file uploaded");

    const key = `uploads/${Date.now()}-${file.name}`;
    await env.BLOB_BUCKET.put(key, file.stream());

    return new Response(JSON.stringify({ ok: true, key }), {
      headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}

// ===== Handle /events =====
async function handleEvents(env, allowedAdmin) {
  const list = await env.HONEYPOT_KV.list({ prefix: "log:" });
  const logs = [];
  for (const key of list.keys) {
    const value = await env.HONEYPOT_KV.get(key.name);
    logs.push({ key: key.name, data: JSON.parse(value) });
  }
  return new Response(JSON.stringify(logs), {
    headers: { "Access-Control-Allow-Origin": allowedAdmin[0] || "*", "Content-Type": "application/json" }
  });
}

// ===== Handle /stats =====
async function handleStats(env, allowedAdmin) {
  const list = await env.HONEYPOT_KV.list({ prefix: "log:" });
  const count = list.keys.length;
  return new Response(JSON.stringify({ logCount: count }), {
    headers: { "Access-Control-Allow-Origin": allowedAdmin[0] || "*", "Content-Type": "application/json" }
  });
}
