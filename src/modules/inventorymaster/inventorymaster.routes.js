const express = require("express");
const router = express.Router();

const { GoogleSpreadsheet } =
  require("google-spreadsheet");

const { JWT } =
  require("google-auth-library");

/* =====================================================
GOOGLE AUTH
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

router.get("/", async (req, res) => {

  try {

    console.log("LOAD INVENTORY MASTER");

    await doc.loadInfo();

    console.log("DOC LOADED");

    const sheet =
      doc.sheetsByTitle["INVENTORY_MASTER"];

    if (!sheet) {

      return res.status(404).json({
        ok: false,
        message:
          "Sheet INVENTORY_MASTER not found"
      });

    }

    console.log("SHEET FOUND");

    const rows = await sheet.getRows();

    console.log(
      "ROWS =",
      rows.length
    );

    const result = rows.map(row => ({

      CODE:
        row.get("CODE") || "",

      NAME:
        row.get("NAME") || "",

      UNIT:
        row.get("UNIT") || "",

      REQUIRED:
        Number(
          row.get("REQUIRED") || 0
        )

    }));

    res.json(result);

  } catch (err) {

    console.error(
      "INVENTORY MASTER ERROR:",
      err
    );

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }

});

module.exports = router;