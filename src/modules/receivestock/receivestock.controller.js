const { GoogleSpreadsheet } =
  require("google-spreadsheet");

const { JWT } =
  require("google-auth-library");

/* =====================================================
AUTH
===================================================== */

const serviceAccountAuth = new JWT({
  email:
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,

  key:
    process.env.GOOGLE_PRIVATE_KEY
      ?.replace(/\\n/g, "\n"),

  scopes: [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
});

/* =====================================================
DOC
===================================================== */

const doc = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID,
  serviceAccountAuth
);

/* =====================================================
GET INVENTORY MASTER
===================================================== */

exports.getInventoryMaster =
  async (req, res) => {

  try {

    await doc.loadInfo();

    const inventorySheet =
      doc.sheetsByTitle[
        "INVENTORY_MASTER"
      ];

    if (!inventorySheet) {

      return res.status(404).json({
        ok: false,
        message:
          "INVENTORY_MASTER not found"
      });

    }

    const rows =
      await inventorySheet.getRows();

    const data = rows.map(r => ({

      code:
        r.get("CODE") || "",

      name:
        r.get("NAME") || "",

      unit:
        r.get("UNIT") || ""

    }));

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};

/* =====================================================
DUMMY FUNCTIONS
===================================================== */

exports.getAllReceiveStock =
  async (req, res) => {

  try {

    await doc.loadInfo();

    const sheet =
      doc.sheetsByTitle[
        "INVENTORY_MOVEMENT"
      ];

    if (!sheet) {

      return res.status(404).json({
        ok: false,
        message:
          "Sheet INVENTORY_MOVEMENT not found"
      });

    }

    const rows =
      await sheet.getRows();

    console.log(
      "MOVEMENT ROWS =",
      rows.length
    );

    const result = rows.map(r => ({

      DATE:
        r.get("DATE") || "",

      CODE:
        r.get("CODE") || "",

      NAME:
        r.get("NAME") || "",

      QTY:
        Number(
          r.get("QTY") || 0
        ),

      UNIT:
        r.get("UNIT") || "",

      LOT:
        r.get("LOT") || "",

      EXP:
        r.get("EXP") || "",

      QRCODE:
        r.get("QRCODE") || ""

    }));

    console.log(result);

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};

/* =====================================================
CREATE RECEIVE STOCK
===================================================== */

exports.createReceiveStock = async (req, res) => {

  try {

    console.log("=== CREATE RECEIVE START ===");

    await doc.loadInfo();

    console.log("Sheets:", Object.keys(doc.sheetsByTitle));

    const movementSheet =
      doc.sheetsByTitle["INVENTORY_MOVEMENT"];

    if (!movementSheet) {

      console.log("❌ INVENTORY_MOVEMENT not found");

      return res.status(404).json({
        ok: false,
        message: "INVENTORY_MOVEMENT not found"
      });

    }

    console.log("✅ INVENTORY_MOVEMENT found");

    const {
      type,
      receivestockNo,
      dateIn,
      supplier,
      user,
      code,
      name,
      qty,
      unit,
      lot,
      exp
    } = req.body;

    const movementRows =
      await movementSheet.getRows();

    let maxMove = 0;

    movementRows.forEach(r => {

      const ref =
        (r.get("MOVEMENT_ID") || "").trim();

      const match =
        ref.match(/^MOVID\d{4}-(\d{5})$/);

      if (!match) return;

      const num = Number(match[1]);

      if (num > maxMove) {
        maxMove = num;
      }

    });

    const year =
      new Date().getFullYear();

    const movementId =
      `MOVID${year}-${String(maxMove + 1).padStart(5, "0")}`;

    const qrCode =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${movementId}`;

    const now =
      new Date().toISOString();

    console.log("movementId =", movementId);

    console.log("Before addRow");

    await movementSheet.addRow({

      MOVEMENT_ID: movementId,
      TYPE: type || "IN",
      REF_NO: receivestockNo,
      DATE: dateIn,
      CODE: code,
      NAME: name,
      QTY: Number(qty || 0),
      UNIT: unit,
      LOT: lot,
      EXP: exp,
      TARGET: supplier || "",
      USER: user || "",
      TIME: now,
      REMARK: "",
      LOCATION: "",
      QRCODE: qrCode

    });

    console.log("After addRow");

    return res.json({

      ok: true,
      movementId,
      qrCode

    });

  } catch (err) {

    console.error("CREATE RECEIVE ERROR:", err);

    return res.status(500).json({

      ok: false,
      message: err.message

    });

  }

};


exports.getNextRefNo =
  async (req, res) => {

  try {

    await doc.loadInfo();

    const sheet =
      doc.sheetsByTitle[
        "INVENTORY_MOVEMENT"
      ];

    const rows =
      await sheet.getRows();

    // =========================
    // DATE NOW
    // =========================

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const prefix =
      `RCIN${year}${month}-`;

    // =========================
    // FILTER ปี/เดือนเดียวกัน
    // =========================

// =========================
// หา Running สูงสุดของปี
// =========================

let maxRunning = 0;

rows.forEach(r => {

  const ref = (r.get("REF_NO") || "").trim();

  if (!ref.startsWith(`RCIN${year}`)) {
    return;
  }

  const parts = ref.split("-");

  if (parts.length !== 2) {
    return;
  }

  const running = parseInt(parts[1], 10);

  if (!isNaN(running) && running > maxRunning) {
    maxRunning = running;
  }

});

// Running ถัดไป
const running =
  String(maxRunning + 1).padStart(5, "0");

    const refNo =
      `${prefix}${running}`;

    console.log(
      "NEXT REFNO =",
      refNo
    );

    res.json({
      refNo
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok:false,
      message: err.message
    });

  }

};