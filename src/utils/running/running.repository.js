const {
  getSheets
} = require("../../config/google");

async function getColumnValues(
  range
) {

  const sheets =
    await getSheets();

  const res =
    await sheets
      .spreadsheets
      .values
      .get({

        spreadsheetId:
          process.env
            .GOOGLE_SHEET_ID,

        range

      });

  return (
    res.data.values || []
  )
  .flat()
  .filter(Boolean);

}

module.exports = {

  getColumnValues

};