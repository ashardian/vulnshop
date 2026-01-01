// vulnshop/assets/js/logger.js - Simplified version without Cloudflare Worker
(function () {
  // Logger that works without backend - just logs to console
  function logToConsole(eventType, payload) {
    if (console && console.log) {
      console.log(`[VulnLogger] ${eventType}:`, payload);
    }
  }

  function baseEvent(eventType, payload) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      ts: Date.now(),
      event_type: eventType,
      url: location.pathname + location.search,
      payload: payload || {},
    };
  }

  window.VulnLogger = {
    logPageView() {
      logToConsole('page_view', baseEvent("page_view", { title: document.title }));
    },
    logSearch(q) {
      logToConsole('search', baseEvent("search", { q: String(q || "") }));
    },
    logFormSubmit(name, data) {
      logToConsole('form_submit', baseEvent("form_submit", { form: name, data }));
    },
    logAdminLogin(username) {
      logToConsole('admin_login', baseEvent("admin_login", { username }));
    },
    logSqlConsole(sql) {
      logToConsole('sql_console', baseEvent("sql_console", { sql }));
    },
    logFileUpload(meta) {
      logToConsole('file_upload', baseEvent("file_upload", meta));
    },
    uploadFile(file, extra = {}) {
      // Simulate file upload
      return Promise.resolve({
        key: `upload_${Date.now()}_${file.name}`,
        name: file.name,
        size: file.size,
        ...extra
      });
    },
  };
})();
