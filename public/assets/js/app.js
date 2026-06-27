/* =====================================================
   MAIN SPA ROUTER (FINAL FIXED VERSION)
===================================================== */

const routes = {

  dashboard: {
    view: "/views/dashboard.html",
    script: "/modules/dashboard/dashboard.view.js"
  },

  receivedrug: {
    view: "/views/receivedrug.html",
    script: "/modules/receivedrug/receivedrug.client.js"
  },

  dispense: {
    view: "/views/dispense.html",
    script: "/modules/dispense/dispense.client.js"
  },

  "emergency-checklist": {
    view: "/views/emergencycheck.html",
    script: "/modules/emergencycheck/emergencycheck.client.js"
  },

  "controlled-drug": {
    view: "/views/controlleddrug.html",
    script: "/modules/controlleddrug/controlleddrug.client.js"
  },

  "inventory-master": {
    view: "/views/inventory-master.html",
    script: "/modules/inventorymaster/inventorymaster.client.js"
  },

  "receive-stock": {
    view: "/views/receive-stock.html",
    script: "/modules/receivestock/receivestock.client.js"
  },

  dailycheck: {
    view: "/views/dailycheck.html",
    script: "/modules/dailycheck/dailycheck.client.js"
  },

  stockout: {
    view: "/views/stock-balance.html",
    script: "/modules/drugbalance/stockbalance.client.js"
  }

};


// =========================
// NAVIGATE
// =========================
function navigate(page) {

  const route = routes[page];

  if (!route) {
    console.error("Route not found:", page);
    return;
  }

  loadView(route.view, route.script);
}

window.navigate = navigate;


// =========================
// LOAD VIEW + MODULE
// =========================
async function loadView(viewPath, scriptPath) {

  const app = document.getElementById("app");

  if (!app) {
    console.error("❌ #app not found");
    return;
  }

  try {

    // 1. load HTML
    const res = await fetch(viewPath);

    if (!res.ok) {
      console.error("❌ View not found:", viewPath);
      return;
    }

    app.innerHTML = await res.text();

    // 2. stabilize DOM
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);

    // 3. load module
    const module = await import(`${scriptPath}?t=${Date.now()}`);

    console.log("📦 MODULE LOADED:", module);

    if (module.init) {
      console.log("🚀 INIT RUN");
      await module.init();
    }

  } catch (err) {
    console.error("loadView error:", err);
  }
}


// expose
window.loadView = loadView;
window.navigate = navigate;


// =========================
// CLICK ROUTER HANDLER
// =========================
document.addEventListener("click", (e) => {

  const el = e.target.closest("[data-route]");

  if (!el) return;

  e.preventDefault();

  navigate(el.dataset.route);
});


// =========================
// INIT APP
// =========================
document.addEventListener("DOMContentLoaded", () => {

  console.log("🚀 Pharmacy SPA Ready");

  navigate("dashboard");
});