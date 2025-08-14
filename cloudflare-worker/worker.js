export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/log" && request.method === "POST") {
      return await handleLog(request, env);
    }

    if (url.pathname === "/upload" && request.method === "POST") {
      return await handleUpload(request, env);
    }

    return new Response("OK", { status: 200 });
  }
};

async function handleLog(request, env) {
  try {
    const data = await request.json();

    // Save to KV with timestamp
    const key = `log:${Date.now()}:${crypto.randomUUID()}`;
    await env.LOGS.put(key, JSON.stringify(data));

    // Send Telegram alert
    await sendTelegram(
      env,
      `🚨 Honeypot Triggered!\n\n` +
      `IP: ${data.ip || "Unknown"}\n` +
      `User-Agent: ${data.userAgent || "Unknown"}\n` +
      `Page: ${data.page || "Unknown"}\n` +
      `Time: ${new Date().toISOString()}`
    );

    return new Response(JSON.stringify({ status: "logged" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}

async function handleUpload(request, env) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response("Invalid upload", { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response("No file uploaded", { status: 400 });
    }

    const filename = `${Date.now()}-${file.name}`;
    await env.UPLOADS.put(filename, await file.arrayBuffer());

    await sendTelegram(env, `📂 File uploaded: ${filename}`);

    return new Response(JSON.stringify({ status: "uploaded" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}

async function sendTelegram(env, message) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram secrets missing!");
    return;
  }

  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown"
    })
  });
}
