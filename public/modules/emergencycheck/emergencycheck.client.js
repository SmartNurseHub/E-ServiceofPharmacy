/*********************************************************
FILE:
modules/emergencycheck/emergencycheck.client.js
*********************************************************/

export async function init() {

  console.log("🚨 Emergency Checklist Module Loaded");

  bindEvents();

  loadChecklist();
  const dailyModule = await import(
  "/modules/dailycheck/dailycheck.client.js?t=" + Date.now()
);

await dailyModule.init();

}

/*********************************************************
BIND EVENTS
*********************************************************/

function bindEvents() {

  /* ================= SCAN QR ================= */

  const scanBtn = document.querySelector("#scanQrBtn");

  scanBtn?.addEventListener("click", () => {

    console.log("📷 OPEN QR SCANNER");

    alert("เปิดระบบสแกน QR");
    

  });

  /* ================= SAVE ================= */

  const saveBtn = document.querySelector("#saveChecklistBtn");

  saveBtn?.addEventListener("click", async () => {

    try {

      console.log("💾 SAVE CHECKLIST");

      saveBtn.disabled = true;

      saveBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        กำลังบันทึก...
      `;

      // TODO:
      // await api save

      await fakeDelay(1000);

      alert("บันทึกข้อมูลสำเร็จ");

    } catch (err) {

      console.error(err);

      alert("เกิดข้อผิดพลาด");

    } finally {

      saveBtn.disabled = false;

      saveBtn.innerHTML = `
        <i class="fa-solid fa-check"></i>
        บันทึก
      `;

    }

  });

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
  inventory: "inventory-master",
  receive: "receive-stock",
  stockout: "dispense",
  check: "emergency-checklist",
  report: "dashboard",
  dailycheck: "dailycheck" // ✅ เพิ่มตรงนี้
};

await window.navigate(map[page]);

      }

    });

  });

}

/*********************************************************
LOAD CHECKLIST
*********************************************************/

async function loadChecklist() {

  try {

    console.log("📦 LOAD EMERGENCY CHECKLIST");

    // TODO:
    // const res = await api.getChecklist();

    await fakeDelay(500);

    updateSummary({
      total: 124,
      ready: 118,
      missing: 4,
      expire: 2
    });

  } catch (err) {

    console.error(err);

  }

}

/*********************************************************
UPDATE SUMMARY
*********************************************************/

function updateSummary(data) {

  document.querySelector("#totalItems").textContent =
    data.total || 0;

  document.querySelector("#readyItems").textContent =
    data.ready || 0;

  document.querySelector("#missingItems").textContent =
    data.missing || 0;

  document.querySelector("#expireItems").textContent =
    data.expire || 0;

}

/*********************************************************
UTIL
*********************************************************/

function fakeDelay(ms) {

  return new Promise(resolve => {

    setTimeout(resolve, ms);

  });

}