const AdmZip = require("adm-zip");
const repository = require("./dispense.repository");
const mapper = require("./dispense.mapper");
const running = require("./dispense.running");

// =========================
// ENTERPRISE MAPPER
// =========================
const { mapToSchema } = require("../../config/mapping.engine");

// =========================
// FORMAT HELPERS
// =========================
function formatPrename(code) {
  const map = {
    "001": "เด็กชาย",
    "002": "เด็กหญิง",
    "003": "นาย",
    "004": "นางสาว",
    "005": "นาง"
  };
  return map[String(code || "").trim()] || "";
}

function formatBirth(v) {
  if (!v) return "";
  const s = String(v);
  if (s.length !== 8) return s;
  return `${s.substring(6, 8)}/${s.substring(4, 6)}/${s.substring(0, 4)}`;
}

function clean(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  if (["0", "-", "null", "undefined"].includes(s)) return "";
  return s;
}

function buildLocationKey(addr) {
  const changwat = String(addr?.CHANGWAT || "").trim().padStart(2, "0");
  const ampur = String(addr?.AMPUR || "").trim().padStart(2, "0");
  const tambon = String(addr?.TAMBON || "").trim().padStart(2, "0");
  return changwat + ampur + tambon;
}

// =========================
// CREATE FROM ZIP (ของเดิมคุณ)
// =========================
async function uploadDrugOpd(buffer) {
  const drugMaster = await repository.getDrugMaster();
  const locationMaster = await repository.getLocationMaster();

  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  let drugOpdRows = [];
  let persons = [];
  let addresses = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;

    const fileName = entry.entryName.toLowerCase();
    const text = entry.getData().toString("utf8");

    if (fileName.includes("drug_opd")) {
      drugOpdRows = mapper.parseDrugOpd(text);
    }

    if (fileName.includes("person")) {
      persons = mapper.parsePerson(text);
    }

    if (fileName.includes("address")) {
      addresses = mapper.parseAddress(text);
    }
  }

  const personMap = new Map();
  const addressMap = new Map();
  const locationMap = new Map();
  const drugOpdMap = new Map();

  for (const p of persons) {
    const cid = String(p.CID || "").trim();
    if (cid) personMap.set(cid, p);
  }

  for (const a of addresses) {
    const cid = String(a.CID || "").trim();
    if (!cid) continue;
    if (!addressMap.has(cid)) addressMap.set(cid, []);
    addressMap.get(cid).push(a);
  }

  for (const l of locationMaster) {
    const key = String(l.code || "").trim();
    const name = String(l.name || "").trim();
    if (key) locationMap.set(key, name);
  }

  for (const r of drugOpdRows) {
    const key = String(r.DNAME || "").trim().toLowerCase();
    if (!drugOpdMap.has(key)) drugOpdMap.set(key, []);
    drugOpdMap.get(key).push(r);
  }

  const dispenseLogs = [];
  const stockMovements = [];
  let count = 0;

  for (const drug of drugMaster) {

    const drugName = String(drug.NAME || "").trim().toLowerCase();
    const matches = drugOpdMap.get(drugName) || [];

    for (const r of matches) {

      const opd = mapToSchema(r, "STOCK");

      const cid = String(r.CID || "").trim();
      const person = personMap.get(cid);
      const addr = (addressMap.get(cid) || [])[0];

      const REF_NO = await running.getRefNo();
      const MOVEMENT_ID = await running.getMovementId();

      const TARGET = person
        ? [
            formatPrename(person.PRENAME),
            person.NAME,
            person.LNAME,
            formatBirth(person.BIRTH),
            person.CID
          ].join(" ")
        : "";

      const LOCATION = [
        clean(addr?.HOUSENO),
        clean(addr?.ROAD)
      ].join(" ");

      const TIME = new Date().toISOString();

      stockMovements.push([
        MOVEMENT_ID,
        "OUT",
        REF_NO,
        opd.DATE,
        drug.CODE,
        drug.NAME,
        Number(opd.QTY || 0),
        drug.UNIT,
        opd.LOT || "",
        opd.EXP || "",
        TARGET,
        r.USER || "SYSTEM",
        TIME,
        "",
        LOCATION
      ]);

      dispenseLogs.push([
        REF_NO,
        opd.DATE,
        "OUT",
        drug.CODE,
        drug.NAME,
        Number(opd.QTY || 0),
        drug.UNIT,
        opd.LOT || "",
        opd.EXP || "",
        TARGET,
        r.USER || "SYSTEM",
        TIME
      ]);

      count++;
    }
  }

  await repository.insertDispenseLog(dispenseLogs);
  await repository.insertStockMovement(stockMovements);

  return { count };
}

// =========================
// READ
// =========================
async function getList() {
  const rows = await repository.getStockMovements();

  return rows.map(r => ({
    refNo: r.refNo,
    type: r.type,
    date: r.date,
    code: r.code,
    name: r.name,
    qty: r.qty,
    unit: r.unit,
    lot: r.lot,
    exp: r.exp,
    target: r.target,
    location: r.location
  }));
}

async function getByRefNo(refNo) {
  const rows = await repository.getStockMovements();
  return rows.find(r => r.refNo === refNo);
}

// =========================
// CREATE
// =========================
async function createDispense(body) {
  const MOVEMENT_ID = await running.getMovementId();
  const TIME = new Date().toISOString();

  const stockRow = {
    MOVEMENT_ID,
    TYPE: "OUT",
    REF_NO: body.refNo,
    DATE: body.date,
    CODE: body.code,
    NAME: body.name,
    QTY: Number(body.qty || 0),
    UNIT: body.unit,
    LOT: body.lot,
    EXP: body.exp,
    TARGET: body.target,
    USER: body.user,
    TIME,
    REMARK: "",
    LOCATION: ""
  };

  await repository.insertDispenseLog({
    REF_NO: body.refNo,
    DATE: body.date,
    TYPE: "OUT",
    CODE: body.code,
    NAME: body.name,
    QTY: body.qty,
    UNIT: body.unit,
    LOT: body.lot,
    EXP: body.exp,
    TARGET: body.target,
    USER: body.user,
    TIME
  });

  await repository.insertStockMovement(stockRow);

  return { refNo: body.refNo };
}

// =========================
// UPDATE (🔥 สำคัญ)
// =========================
async function updateDispense(refNo, body) {

  await repository.updateDispense(refNo, body);
  await repository.updateStockMovement(refNo, body);

  return { refNo };
}

// =========================
// DELETE (🔥 สำคัญ)
// =========================
async function deleteDispense(refNo) {

  await repository.deleteDispense(refNo);
  await repository.deleteStockMovement(refNo);

  return { refNo };
}

module.exports = {
  uploadDrugOpd,
  getList,
  getByRefNo,
  createDispense,
  updateDispense,
  deleteDispense
};