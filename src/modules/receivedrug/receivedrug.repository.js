const {
  readRows,
  appendRow
} = require("../../config/google");

const DRUG_MASTER = "DRUG_MASTER";
const DRUG_RECEIVE = "DRUG_RECEIVE";
const STOCK_MOVEMENT ="STOCK_MOVEMENT";

exports.getDrugMaster = async () => {

  return await readRows(
    DRUG_MASTER
  );

};

exports.getReceiveList = async () => {

  return await readRows(
    DRUG_RECEIVE
  );

};

exports.insertReceiveDrug =
async (data) => {

  return await appendRow(
    DRUG_RECEIVE,
    {
      RECEIVE_NO: data.receiveNo,
      DATE: data.dateIn,
      TYPE: "IN",
      CODE: data.code,
      NAME: data.name,
      QTY: data.qty,
      UNIT: data.unit,
      LOT: data.lot,
      EXP: data.exp,
      SUPPLIER: data.supplier,
      USER: data.user,
      TIMESTAMP: new Date().toLocaleString("th-TH",{timeZone: "Asia/Bangkok"})
    }
  );

};


exports.insertStockMovement =
async (data) => {

  return await appendRow(
    STOCK_MOVEMENT,
    {
      MOVEMENT_ID: data.movementId,
      TYPE: "IN",
      REF_NO: data.receiveNo,
      DATE: data.dateIn,
      CODE: data.code,
      NAME: data.name,
      QTY: data.qty,
      UNIT: data.unit,
      LOT: data.lot,
      EXP: data.exp,
      TARGET: "DRUG_STORE",
      USER: data.user,
      TIME: new Date()
        .toLocaleString("th-TH"),
      REMARK: data.supplier,
      LOCATION: "คลังยากลาง"
    }
  );

};

exports.getStockMovements = async () => {
  return await readRows("STOCK_MOVEMENT");
};