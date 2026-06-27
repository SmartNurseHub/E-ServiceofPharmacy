require("dotenv").config();

const path = require("path");
const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// =========================
// AUTH
// =========================

async function getSheets() {

  const authConfig = {
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  };

  // Render
  if (process.env.GOOGLE_SERVICE_ACCOUNT) {
  console.log("✅ Google Auth : Render Environment");

    authConfig.credentials =
      JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT
      );

  } else {
  console.log("✅ Google Auth : Local service-account.json");

    // Local
    authConfig.keyFile =
      path.join(
        process.cwd(),
        "service-account.json"
      );
  }

  const auth =
    new google.auth.GoogleAuth(
      authConfig
    );

  const client =
    await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client
  });
}

console.log(
  "GOOGLE_SERVICE_ACCOUNT EXISTS =",
  !!process.env.GOOGLE_SERVICE_ACCOUNT
);
// =========================
// CACHE HEADERS
// =========================

const headerCache = new Map();

async function getHeaders(sheetName) {

  if (headerCache.has(sheetName)) {
    return headerCache.get(sheetName);
  }

  const sheets = await getSheets();

  const res =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`
    });

  const headers =
    (res.data.values || [])[0] || [];

  headerCache.set(
    sheetName,
    headers
  );

  return headers;
}

// =========================
// READ
// =========================

async function readRows(sheetName) {

  try {

    const sheets =
      await getSheets();

    const res =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`
      });

    const values =
      res.data.values || [];

    if (!values.length) {
      return [];
    }

    const headers = values[0];

    return values
      .slice(1)
      .map(row => {

        const obj = {};

        headers.forEach((h, i) => {
          obj[h] = row[i] || "";
        });

        return obj;
      });

  } catch (err) {

    console.error(
      "❌ READ ERROR",
      err
    );

    return [];
  }
}

// =========================
// APPEND
// =========================

async function appendRow(
  sheetName,
  data
) {

  try {

    const sheets =
      await getSheets();

    const headers =
      await getHeaders(sheetName);

    const row =
      headers.map(
        h => data[h] ?? ""
      );

    await sheets
      .spreadsheets
      .values
      .append({
        spreadsheetId:
          SPREADSHEET_ID,
        range:
          `${sheetName}!A:Z`,
        valueInputOption:
          "USER_ENTERED",
        requestBody: {
          values: [row]
        }
      });

    return true;

  } catch (err) {

    console.error(
      "❌ APPEND ERROR",
      err
    );

    return false;
  }
}

module.exports = {
  getSheets,
  readRows,
  appendRow
};