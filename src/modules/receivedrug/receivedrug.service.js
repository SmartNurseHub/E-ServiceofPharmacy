const repo = require("./receivedrug.repository");

exports.getDrugMaster = async () => {

  return await repo.getDrugMaster();

};

exports.getList = async () => {

  return await repo.getReceiveList();

};

exports.getRunningNo = async () => {

  const rows =
    await repo.getReceiveList();

  const now = new Date();

  const yyyy =
    now.getFullYear();

  const mm =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const dd =
    String(now.getDate())
      .padStart(2, "0");

  const dateKey =
    `${yyyy}${mm}${dd}`;

  const prefix =
    `RCIC${dateKey}-`;

  let maxSeq = 0;

  rows.forEach(row => {

    const no =
      row.RECEIVE_NO || "";

    if (no.startsWith(prefix)) {

      const seq =
        parseInt(
          no.split("-")[1] || "0",
          10
        );

      if (seq > maxSeq) {
        maxSeq = seq;
      }

    }

  });

  const nextSeq =
    maxSeq + 1;

  return (
    prefix +
    String(nextSeq)
      .padStart(5, "0")
  );

};

exports.create = async (data) => {

  const receiveNo =
    await exports.getRunningNo();

  data.receiveNo =
    receiveNo;

  await repo.insertReceiveDrug(
    data
  );

  data.movementId =
  await exports.getMovementRunningNo();

  await repo.insertStockMovement(
    data
  );

  return {
    receiveNo
  };

};

exports.getMovementRunningNo = async () => {

  const rows =
    await repo.getStockMovements();

  const now = new Date();

  const yyyy = now.getFullYear();

  const mm =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const dd =
    String(now.getDate())
      .padStart(2, "0");

  const dateKey =
    `${yyyy}${mm}${dd}`;

  const prefix =
    `MV${dateKey}-`;

  let maxSeq = 0;

  rows.forEach(row => {

    const no =
      row.MOVEMENT_ID || "";

    if (no.startsWith(prefix)) {

      const seq =
        parseInt(
          no.split("-")[1] || "0",
          10
        );

      if (seq > maxSeq) {
        maxSeq = seq;
      }

    }

  });

  return (
    prefix +
    String(maxSeq + 1)
      .padStart(5, "0")
  );

};