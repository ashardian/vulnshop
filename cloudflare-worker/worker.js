export default {
  async fetch(request, env, ctx) {
    try {
      // Parse request data
      const { method, url, headers } = request;
      const cf = request.cf || {};
      const ip = headers.get("CF-Connecting-IP") || "Unknown IP";
      const ua = headers.get("User-Agent") || "Unknown UA";
      const referer = headers.get("Referer") || "No referer";
      const country = cf.country || "??";
      const asn = cf.asn || "N/A";
      const path = new URL(url).pathname;
      const time = new Date().toISOString();

      let payload = {};
      if (method === "POST") {
        try {
          payload = await request.json();
        } catch {
          payload = { error: "Invalid JSON" };
        }
      } else {
        payload = Object.fromEntries(new URL(url).searchParams);
      }

      // Mask sensitive data
      //const maskPII = (str) =>
        //typeof str === "string"
          //? str
              //.replace(/\b[\w.%+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, "[EMAIL]")
              //.replace(/\b\d{13,16}\b/g, "[CREDIT_CARD]")
              //.replace(/\b\d{10,12}\b/g, "[PHONE]")
          //: str;
      //payload = JSON.parse(JSON.stringify(payload), (_, v) => maskPII(v));

      // Build log entry
      const logEntry = {
        time,
        ip,
        country,
        asn,
        ua,
        referer,
        path,
        method,
        payload,
      };

      // Store in KV (with 7-day TTL)
      if (env.HONEYPOT_KV) {
        await env.HONEYPOT_KV.put(
          `log_${Date.now()}_${ip}`,
          JSON.stringify(logEntry),
          { expirationTtl: 60 * 60 * 24 * 7 }
        );
      }

      // Send Telegram alert
      if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
        const alertMsg = `🚨 Honeypot Triggered 🚨
🌐 IP: ${ip} (${country}, ASN ${asn})
🕒 Time: ${time}
📍 Path: ${path}
📑 Data: ${JSON.stringify(payload)}`;
        await sendTelegram(env, alertMsg);
      }

      return new Response(JSON.stringify({ status: "logged" }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

async function sendTelegram(env, text) {
  const api = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "Markdown",
      }),
    });
    if (res.ok) break;
    await new Promise((r) => setTimeout(r, (i + 1) * 1000));
  }
}

