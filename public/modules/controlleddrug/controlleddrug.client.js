/*********************************************************
FILE:
modules/controlleddrug/controlleddrug.client.js
*********************************************************/

export async function init() {

  console.log("🚨 Controlled Drug Module Loaded");
   bindEvents();

}

/*********************************************************
BIND EVENTS
*********************************************************/

function bindEvents() {

  /* ================= MENU ================= */

 document.querySelectorAll(".ems-check-menu-btn")
  .forEach(btn => {

    btn.addEventListener("click", async () => {

      const page = btn.dataset.page;

      console.log("📂 OPEN PAGE:", page);

      /* ACTIVE MENU */

      document.querySelectorAll(".ems-check-menu-btn")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");

      /* LOAD VIEW */

      if (window.loadView) {

       const map = {
  drugreceive: "receivedrug",
  drugdispense: "dispense",
  stockout: "stockout",
  check: "emergency-checklist",
  report: "dashboard",
  dailycheck: "dailycheck"
};

window.navigate(map[page]);
      }

    });

  });

}
