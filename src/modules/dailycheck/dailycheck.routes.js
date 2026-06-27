const express = require("express");
const router = express.Router();

const { getSheets } = require("../../config/google");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

router.get("/", async (req, res) => {
  try {
    // ==========================
    // รับเดือน / ปี
    // ==========================
const now = new Date();

const month = Number(req.query.month || (now.getMonth() + 1));
const year = Number(req.query.year || now.getFullYear());

const sheets = await getSheets();

    // ==========================
    // INVENTORY_MASTER
    // A = CODE
    // B = NAME
    // C = UNIT
    // D = REQUIRED
    // ==========================

    const masterResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "INVENTORY_MASTER!A:D",
    });

    const masterValues = masterResult.data.values || [];

    if (masterValues.length <= 1) {
      return res.json({
        ok: true,
        data: [],
      });
    }

    const masterRows = masterValues.slice(1);

    // ==========================
    // COUNT_SESSION
    // A SESSION_ID
    // B MOVEMENT_ID
    // C CODE
    // D NAME
    // E QTY
    // F USER
    // G TIME
    // ==========================

    const countResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "COUNT_SESSION!A:G",
    });

    const countValues = countResult.data.values || [];

    const countRows =
      countValues.length > 1 ? countValues.slice(1) : [];

    // =====================================================
    // สร้าง Map สำหรับรวมจำนวน
    // key =
    // CODE_YEAR_MONTH_DAY
    // เช่น
    // EMER001_2026_6_4
    // =====================================================

    const stockMap = {};

    countRows.forEach((row) => {
      const code = (row[2] || "").trim();

      if (!code) return;

      const qty = Number(row[4] || 0);

      const time = row[6];

      if (!time) return;

      const d = new Date(time);

      if (isNaN(d.getTime())) return;

      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const day = d.getDate();

      // เอาเฉพาะเดือน/ปีที่เลือก
      if (y !== year) return;
      if (m !== month) return;

      const key = `${code}_${y}_${m}_${day}`;

      stockMap[key] = (stockMap[key] || 0) + qty;
    });

    // =====================================================
    // Merge INVENTORY_MASTER + COUNT_SESSION
    // =====================================================

    const output = [];

    masterRows.forEach((row) => {
      const code = (row[0] || "").trim();
      const name = row[1] || "";
      const unit = row[2] || "";
      const required = Number(row[3] || 0);

      const obj = {
        CODE: code,
        NAME: name,
        UNIT: unit,
        REQUIRED: required,
      };

      for (let day = 1; day <= 31; day++) {
        const key = `${code}_${year}_${month}_${day}`;

        obj[day] = stockMap[key] || "";
      }

      output.push(obj);
    });

    return res.json({
      ok: true,
      month,
      year,
      data: output,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
});

module.exports = router;