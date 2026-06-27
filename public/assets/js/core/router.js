/*********************************************************
ROUTER CONNECT : Emergency Checklist
FILE : app.routes.js
*********************************************************/
const routes = {

  dashboard: {
    view: "/views/dashboard.html",
    module: "/modules/dashboard/dashboard.client.js"
  },

  receivedrug: {
  view: "/views/receivedrug.html",
  module: "/modules/receivedrug/receivedrug.client.js"
},

  dispense: {
    view: "/views/dispense.html",
    module: "/modules/dispense/dispense.client.js"
  },

  "emergency-checklist": {
    view: "/views/emergencycheck.html",
    module: "/modules/emergencycheck/emergencycheck.client.js"
  },

  reports: {
    view: "/views/reports.html",
    module: "/modules/reports/reports.client.js"
  },

  settings: {
    view: "/views/settings.html",
    module: "/modules/settings/settings.client.js"
  },

  dailycheck: {
    view: "/views/dailycheck.html",
    module: "/modules/dailycheck/dailycheck.client.js"
  },

  stockout: {
  view: "/views/stock-balance.html",
  module: "/modules/drugbalance/stockbalance.client.js"
}

  

};


let currentModule = null;
let isLoading = false;

export async function initRouter() {

  window.addEventListener("hashchange", () => {
    loadRoute();
  });

  if (!location.hash) {
    location.hash = "#dashboard";
    return;
  }

  await loadRoute();
}

async function loadRoute() {

  if (isLoading) return;
  isLoading = true;

  try {

    const hash = location.hash.replace("#", "");

    if (!hash) {
      location.hash = "#dashboard";
      return;
    }

    const route = routes[hash] || routes.dashboard;

    // init store once
    if (!window.__storeReady) {
      await PharmacyStore.initStore?.();
      window.__storeReady = true;
    }

    // destroy old module
    if (currentModule?.destroy) {
      await currentModule.destroy();
    }

    currentModule = null;

    // load view
    const html = await fetch(route.view).then(r => r.text());
    document.getElementById("viewContainer").innerHTML = html;

    await new Promise(r => requestAnimationFrame(r));

    // load module
    const module = await import(route.module);

    currentModule = module;

    if (module.init) {
      await module.init();
    }

  } catch (err) {
    console.error("Route error:", err);
  } finally {
    isLoading = false;
  }
}