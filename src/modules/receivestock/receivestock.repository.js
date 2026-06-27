const google = require("../../config/google");

const SHEET = "INVENTORY_MOVEMENT";
const MASTER_SHEET = "INVENTORY_MASTER";

/* =========================
GET ALL
========================= */
async function getAllReceiveStock() {
  const rows = await google.readRows(SHEET);
  return rows || [];
}

/* =========================
INSERT
========================= */
async function insertReceiveStock(data) {
  await google.appendRow(SHEET, data);
  return data;
}

/* =========================
MASTER (รองรับ header ทุกแบบ)
========================= */
async function getInventoryMaster() {
  const rows = await google.readRows(MASTER_SHEET);

  return rows.map(r => ({
    CODE: r.CODE || r.Code || r.code || "",
    NAME: r.NAME || r.Name || r.name || "",
    UNIT: r.UNIT || r.Unit || r.unit || ""
  }));
}

module.exports = {
  getAllReceiveStock,
  insertReceiveStock,
  getInventoryMaster
};