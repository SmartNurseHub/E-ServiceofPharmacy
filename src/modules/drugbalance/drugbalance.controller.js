const { getSheets } = require("../../config/google");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;


// =====================================================
// STOCK BALANCE (FILTER BY DRUG CODE)
// =====================================================
exports.getStockBalance = async (req, res) => {

  try {
    const selectedCode = req.query.code || "";

console.log("FILTER CODE:", selectedCode);


    const sheets = await getSheets();

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "STOCK_MOVEMENT!A:O"
    });

    const rows = result.data.values || [];

    // ===========================
    // ไม่มีข้อมูล
    // ===========================
    if (rows.length <= 1) {
      return res.json({
        success: true,
        data: {
          rows: [],
          summary: {
            in: 0,
            out: 0,
            balance: 0,
            count: 0
          }
        }
      });
    }

    // ลบ Header
    rows.shift();

    // ===========================
    // เรียงตาม DATE (Column D)
    // ===========================
    rows.sort((a, b) => new Date(a[3]) - new Date(b[3]));

    const balanceByCode = {};

const filteredRows = selectedCode
  ? rows.filter(r => {

      const sheetCode = (r[4] || "")
        .trim()
        .toUpperCase();

      const inputCode = (selectedCode || "")
        .trim()
        .toUpperCase();

      return sheetCode === inputCode;

    })
  : rows;

    const data = filteredRows.map(r => {

      const movementId = r[0] || "";
      const type = (r[1] || "").trim().toUpperCase();
      const refNo = r[2] || "";
      const date = r[3] || "";
      const code = r[4] || "";
      const name = r[5] || "";
      const qty = Number(r[6] || 0);
      const unit = r[7] || "";
      const lot = r[8] || "";
      const exp = r[9] || "";
      const target = r[10] || "";
      const user = r[11] || "";
      const time = r[12] || "";
      const remark = r[13] || "";
      const location = r[14] || "";

      // ===========================
      // BALANCE PER CODE
      // ===========================
      if (!balanceByCode[code]) {
        balanceByCode[code] = 0;
      }

      if (type === "IN") {
        balanceByCode[code] += qty;
      } else if (type === "OUT") {
        balanceByCode[code] -= qty;
      }

      return {
        movementId,
        type,
        refNo,
        date,
        code,
        name,

        in: type === "IN" ? qty : 0,
        out: type === "OUT" ? qty : 0,

        balance: balanceByCode[code],

        unit,
        lot,
        exp,
        target,
        user,
        time,
        remark,
        location
      };

    });

    // ===========================
    // SUMMARY
    // ===========================
    const summary = data.reduce(
      (acc, item) => {

        acc.in += item.in;
        acc.out += item.out;
        acc.count++;

        return acc;

      },
      {
        in: 0,
        out: 0,
        count: 0
      }
    );

    summary.balance =
      Object.values(balanceByCode)
        .reduce((sum, qty) => sum + qty, 0);

    res.json({
      success: true,
      data: {
        rows: data,
        summary
      }
    });

  } catch (err) {

    console.error("STOCK BALANCE ERROR:", err);

    res.status(500).json({
      success: false,
      message: "SERVER_ERROR"
    });

  }
};


// =====================================================
// DRUG MASTER (DROPDOWN)
// =====================================================
exports.getDrugMaster = async (req, res) => {

  try {

    const sheets = await getSheets();

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "DRUG_MASTER!A:B"
    });

    const rows = result.data.values || [];

    const data = rows.slice(1).map(r => ({
      code: r[0] || "",
      name: r[1] || ""
    }));

    res.json(data);

  } catch (err) {

    console.error("DRUG MASTER ERROR:", err);

    res.status(500).json({
      message: err.message
    });

  }
};