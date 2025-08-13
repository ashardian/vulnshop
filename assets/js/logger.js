// vulnshop/assets/js/logger.js
(function () {
  const WORKER_ENDPOINT = "https://<your-worker-subdomain>.workers.dev";
  const MAX_RETRIES = 2;

  async function post(path, bodyObj) {
    const url = `${WORKER_ENDPOINT}${path}`;
    const body = JSON.stringify(bodyObj);
    if (navigator.sendBeacon && path === "/log") {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    let lastErr;
    for (let i = 0; i <= MAX_RETRIES; i++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
          mode: "cors",
        });
        if (res.ok) return;
      } catch (e) {
        lastErr = e;
      }
      await new Promise((r) => setTimeout(r, 200 * (i + 1)));
    }
    console.debug("logger: failed", lastErr);
  }

  function baseEvent(eventType, payload) {
    return {
      id: crypto.randomUUID(),
      ts: Date.now(),
      event_type: eventType,
      url: location.pathname + location.search,
      payload: payload || {},
    };
  }

  function startHeartbeat() {
    // Send a heartbeat every 30s for long sessions (sampled)
    if (Math.random() < 0.2) {
      setInterval(() => post("/log", baseEvent("heartbeat", { t: Date.now() })), 30000);
    }
  }

  window.VulnLogger = {
    logPageView() {
      post("/log", baseEvent("page_view", { title: document.title }));
      startHeartbeat();
    },
    logSearch(q) {
      post("/log", baseEvent("search", { q: String(q || "") }));
    },
    logFormSubmit(name, data) {
      post("/log", baseEvent("form_submit", { form: name, data }));
    },
    logAdminLogin(username) {
      post("/log", baseEvent("admin_login", { username }));
    },
    logSqlConsole(sql) {
      post("/log", baseEvent("sql_console", { sql }));
    },
    logFileUpload(meta) {
      post("/log", baseEvent("file_upload", meta));
    },
    uploadFile(file, extra = {}) {
      const form = new FormData();
      form.append("file", file);
      form.append("filename", file.name);
      for (const [k, v] of Object.entries(extra)) form.append(k, v);
      return fetch(`${WORKER_ENDPOINT}/upload`, { method: "POST", body: form, mode: "cors" }).then((r) => r.json());
    },
  };
})();
