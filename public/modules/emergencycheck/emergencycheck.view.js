/*********************************************************
FILE:
modules/emergencycheck/emergencycheck.client.js
*********************************************************/

export async function init() {

  console.log("🚨 Emergency Checklist Module Loaded");

  bindEvents();

  loadChecklist();

}

/*********************************************************
BIND EVENTS
*********************************************************/

function bindEvents() {

  const scanBtn = document.querySelector("#scanQrBtn");

  scanBtn?.addEventListener("click", () => {

    console.log("📷 OPEN QR SCANNER");

  });

}

/*********************************************************
LOAD CHECKLIST
*********************************************************/

function loadChecklist() {

  console.log("📦 LOAD EMERGENCY CHECKLIST");

}