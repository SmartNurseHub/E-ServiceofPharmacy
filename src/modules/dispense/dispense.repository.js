const {
  getSheets,
  readRows
} = require("../../config/google");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// =====================
// SAFE VALUE
// =====================
function safe(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

// =====================
// NORMALIZE ROW (สำคัญมาก FIX BUG CODE ว่าง)
// =====================
function norm(r) {
  return {
    CODE:
      r.CODE || r.Code || r["CODE"] || r["Code"] || "",

    NAME:
      r.NAME || r.Name || r["NAME"] || r["Name"] || "",

    UNIT:
      r.UNIT || r.Unit || r["UNIT"] || r["Unit"] || "",

    LOT:
      r.LOT || r.Lot || r["LOT"] || r["Lot"] || "",

    EXP:
      r.EXP || r.Exp || r["EXP"] || r["Exp"] || ""
  };
}

// =====================
// INSERT DISPENSE LOG
// =====================
async function insertDispenseLog(row) {

  const sheets = await getSheets();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "DISPENSE_LOG!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        safe(row.REF_NO),
        safe(row.DATE),
        safe(row.TYPE),
        safe(row.CODE),
        safe(row.NAME),
        Number(row.QTY || 0),
        safe(row.UNIT),
        safe(row.LOT),
        safe(row.EXP),
        safe(row.TARGET),
        safe(row.USER),
        safe(row.TIME)
      ]]
    }
  });
}

// =====================
// INSERT STOCK MOVEMENT
// =====================
async function insertStockMovement(row) {

  const sheets = await getSheets();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "STOCK_MOVEMENT!A:O",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        safe(row.MOVEMENT_ID),
        safe(row.TYPE),
        safe(row.REF_NO),
        safe(row.DATE),
        safe(row.CODE),
        safe(row.NAME),
        Number(row.QTY || 0),
        safe(row.UNIT),
        safe(row.LOT),
        safe(row.EXP),
        safe(row.TARGET),
        safe(row.USER),
        safe(row.TIME),
        safe(row.REMARK),
        safe(row.LOCATION)
      ]]
    }
  });
}

// =====================
// DRUG MASTER (LEGACY)
// =====================
async function getDrugMaster() {
  return await readRows("DRUG_MASTER");
}

// =====================
// DRUG RECEIVE (FIXED)
// =====================
function cleanRow(r) {
  const out = {};
  for (const k in r) {
    out[String(k).trim()] = r[k];
  }
  return out;
}

async function getDrugReceive() {

  const rows = await readRows("DRUG_RECEIVE");

  return rows
    .map(cleanRow)   // 🔥 ใช้ตัวเดียวพอ
    .map(r => ({

      CODE: r.CODE || r.Code || "",
      NAME: r.NAME || r.Name || "",
      UNIT: r.UNIT || r.Unit || "",
      LOT: r.LOT || r.Lot || "",
      EXP: r.EXP || r.Exp || ""

    }))
    .filter(r => r.CODE);
}

// =====================
// PERSON
// =====================
async function getPerson() {
  return await readRows("PERSON");
}

// =====================
// ADDRESS
// =====================
async function getAddress() {
  return await readRows("ADDRESS");
}

// =====================
// LOCATION MASTER
// =====================
async function getLocationMaster() {

  const rows = await readRows("CHANGWAT_MASTER");

  return rows.map(r => ({
    code: safe(
      r["Location Code"] ||
      r["LOCATION_CODE"] ||
      r["LOCATIONCODE"]
    ),
    name: safe(
      r["Location"] ||
      r["LOCATION"]
    )
  })).filter(x => x.code);
}

// =====================
// STOCK MOVEMENTS
// =====================
async function getStockMovements() {

  const sheets = await getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "STOCK_MOVEMENT!A:O"
  });

  const rows = res.data.values || [];
  const dataRows = rows.slice(1);

  return dataRows.map(r => ({
    movementId: r[0] || "",
    type: r[1] || "",
    refNo: r[2] || "",
    date: r[3] || "",
    code: r[4] || "",
    name: r[5] || "",
    qty: r[6] || "",
    unit: r[7] || "",
    lot: r[8] || "",
    exp: r[9] || "",
    target: r[10] || "",
    user: r[11] || "",
    time: r[12] || "",
    remark: r[13] || "",
    location: r[14] || ""
  }));
}

// =====================
// DISPENSE LOGS
// =====================
async function getDispenseLogs() {

  const sheets = await getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "DISPENSE_LOG!A:L"
  });

  const rows = res.data.values || [];
  const dataRows = rows.slice(1);

  return dataRows.map(r => ({
    refNo: r[0] || "",
    date: r[1] || "",
    type: r[2] || "",
    code: r[3] || "",
    name: r[4] || "",
    qty: r[5] || "",
    unit: r[6] || "",
    lot: r[7] || "",
    exp: r[8] || "",
    target: r[9] || "",
    user: r[10] || "",
    time: r[11] || ""
  }));
}


async function updateDispense(
  refNo,
  body
) {

  const sheets =
    await getSheets();

  const res =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DISPENSE_LOG!A:L"
    });

  const rows =
    res.data.values || [];

  const idx =
    rows.findIndex(
      r => r[0] === refNo
    );

  if (idx < 1)
    throw new Error(
      "REF_NO not found"
    );

  rows[idx] = [
    refNo,
    body.date,
    "OUT",
    body.code,
    body.name,
    body.qty,
    body.unit,
    body.lot,
    body.exp,
    body.target,
    body.user,
    new Date().toISOString()
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `DISPENSE_LOG!A${idx+1}:L${idx+1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rows[idx]]
    }
  });

}


async function updateStockMovement(
  refNo,
  body
) {

  const sheets =
    await getSheets();

  const res =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "STOCK_MOVEMENT!A:O"
    });

  const rows =
    res.data.values || [];

  const idx =
    rows.findIndex(
      r => r[2] === refNo
    );

  if (idx < 1)
    throw new Error(
      "REF_NO not found"
    );

  rows[idx][3] = body.date;
  rows[idx][4] = body.code;
  rows[idx][5] = body.name;
  rows[idx][6] = body.qty;
  rows[idx][7] = body.unit;
  rows[idx][8] = body.lot;
  rows[idx][9] = body.exp;
  rows[idx][10] = body.target;
  rows[idx][11] = body.user;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `STOCK_MOVEMENT!A${idx+1}:O${idx+1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [rows[idx]]
    }
  });

}


// =====================
// DELETE DISPENSE LOG
// =====================
async function deleteDispense(refNo) {

  const sheets =
    await getSheets();

  const res =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DISPENSE_LOG!A:L"
    });

  const rows =
    res.data.values || [];

  if (rows.length <= 1)
    return;

  const header = rows[0];

  const data =
    rows
      .slice(1)
      .filter(r => r[0] !== refNo);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: "DISPENSE_LOG!A:L"
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "DISPENSE_LOG!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        header,
        ...data
      ]
    }
  });

}

// =====================
// DELETE STOCK MOVEMENT
// =====================
async function deleteStockMovement(refNo) {

  const sheets =
    await getSheets();

  const res =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "STOCK_MOVEMENT!A:O"
    });

  const rows =
    res.data.values || [];

  if (rows.length <= 1)
    return;

  const header = rows[0];

  const data =
    rows
      .slice(1)
      .filter(r => r[2] !== refNo);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: "STOCK_MOVEMENT!A:O"
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "STOCK_MOVEMENT!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        header,
        ...data
      ]
    }
  });

}

// =====================
// EXPORT
// =====================
module.exports = {

  insertDispenseLog,
  insertStockMovement,

  updateDispense,
  updateStockMovement,

  deleteDispense,
  deleteStockMovement,

  getDrugMaster,
  getDrugReceive,
  getPerson,
  getAddress,
  getLocationMaster,
  getStockMovements,
  getDispenseLogs

};