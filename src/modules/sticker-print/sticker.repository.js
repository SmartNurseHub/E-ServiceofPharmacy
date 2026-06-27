const path = require("path");
const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({

  credentials:
    process.env.GOOGLE_SERVICE_ACCOUNT
      ? JSON.parse(
          process.env.GOOGLE_SERVICE_ACCOUNT
        )
      : undefined,

  keyFile:
    process.env.GOOGLE_SERVICE_ACCOUNT
      ? undefined
      : path.join(
          process.cwd(),
          "credentials.json"
        ),

  scopes: [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
});

const SHEET_ID =
  process.env.GOOGLE_SHEET_ID;

exports.getMovement = async () => {

  const client =
    await auth.getClient();

  const sheets =
    google.sheets({
      version: "v4",
      auth: client
    });

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "INVENTORY_MOVEMENT!A1:P"
    });

  const rows =
    response.data.values || [];

  if (rows.length <= 1) return [];

  const headers = rows[0];

  return rows
    .slice(1)
    .map(r => {

      const obj = {};

      headers.forEach((h, i) => {
        obj[h] = r[i] || "";
      });

      return obj;

    });

};