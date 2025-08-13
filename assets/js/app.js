// vulnshop/assets/js/app.js
const Cart = {
  key: "vulnshop_cart",
  read() {
    try { return JSON.parse(localStorage.getItem(this.key) || "[]"); } catch { return []; }
  },
  write(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
  },
  add(itemId, qty) {
    const items = this.read();
    const found = items.find((i) => i.id === itemId);
    if (found) found.qty += qty; else items.push({ id: itemId, qty });
    this.write(items);
  },
  clear() { this.write([]); }
};

document.addEventListener("DOMContentLoaded", async () => {
  if (window.VulnLogger) VulnLogger.logPageView();

  // Hook generic logged forms
  document.querySelectorAll("form[data-log]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      const fd = new FormData(form);
      const data = {};
      fd.forEach((v, k) => (data[k] = v));
      VulnLogger.logFormSubmit(form.getAttribute("name") || "form", data);
    });
  });

  // Search reflect
  const searchForm = document.querySelector("#search-form");
  const searchInput = document.querySelector("#search-input");
  const searchResults = document.querySelector("#search-results");
  if (searchForm && searchResults) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = searchInput?.value || "";
      VulnLogger.logSearch(q);
      searchResults.innerHTML = `Results for "<strong>${escapeHtml(q)}</strong>": (0 found)`;
    });
  }

  // Product page dynamic content + add-to-cart
  const params = new URLSearchParams(location.search);
  const prodId = Number(params.get("id") || 0);
  if (document.getElementById("prod-id")) {
    const products = await fetch("/vulnshop/assets/data/products.json").then((r) => r.json()).catch(() => []);
    const prod = products.find((p) => p.id === prodId) || { id: prodId, name: `Product #${prodId}`, price: 99, desc: "A great product." };
    document.getElementById("prod-id").value = String(prod.id);
    document.getElementById("prod-title").textContent = prod.name;
    document.getElementById("prod-desc").textContent = prod.desc;
    document.getElementById("prod-price").textContent = `$${prod.price.toFixed(2)}`;
    const form = document.querySelector('form[name="add-to-cart"]');
    form?.addEventListener("submit", (e) => {
      const qty = Number((new FormData(form)).get("qty") || 1);
      Cart.add(prod.id, qty);
    });
  }

  // Admin login fake success
  const adminLoginForm = document.querySelector("#admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = adminLoginForm.querySelector('input[name="username"]')?.value || "";
      VulnLogger.logAdminLogin(u);
      setTimeout(() => (window.location.href = "/vulnshop/admin/index.html"), 300 + Math.random() * 800);
    });
  }

  // SQL console simulate
  const sqlForm = document.querySelector("#sql-form");
  const sqlOut = document.querySelector("#sql-output");
  if (sqlForm && sqlOut) {
    sqlForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const sql = sqlForm.querySelector('textarea[name="sql"]')?.value || "";
      VulnLogger.logSqlConsole(sql);
      sqlOut.textContent = simulateSql(sql);
    });
  }
});

function escapeHtml(s) {
  return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function simulateSql(sql) {
  const l = (sql || "").toLowerCase();
  if (l.includes("select")) return "id | email | created_at\n---+----------------------+---------------------\n1  | alice@example.com   | 2024-10-21 10:12:04\n2  | bob@example.com     | 2024-10-22 14:45:17";
  if (l.includes("drop") || l.includes("delete")) return "ERROR: permission denied: read-only replica";
  return "OK (0 rows affected)";
}
