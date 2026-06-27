const repository =
require("./dispense.repository");

// ======================
// MOVEMENT RUNNING
// รีเซ็ตทุกวัน
// ======================

let movementSeq = 0;

let currentDate = null;

// ======================
function yyyymmdd() {

  const d =
    new Date();

  return (
    d.getFullYear() +
    String(
      d.getMonth() + 1
    ).padStart(2, "0") +
    String(
      d.getDate()
    ).padStart(2, "0")
  );

}

// ======================
function currentYear() {

  return String(
    new Date()
      .getFullYear()
  );

}

// ======================
function resetMovement() {

  const today =
    yyyymmdd();

  if (
    currentDate !== today
  ) {

    movementSeq = 0;

    currentDate =
      today;

  }

}

// ======================
// MOVYYYYMMDD-00001
// ======================
function getMovementId() {

  resetMovement();

  movementSeq++;

  return (
    "MOV" +
    yyyymmdd() +
    "-" +
    String(
      movementSeq
    ).padStart(
      5,
      "0"
    )
  );

}

// ======================
// RCOUTYYYYMMDD-00001
// รันต่อเนื่องทั้งปี
// รีเซ็ตปีใหม่
// ======================
async function getRefNo() {

  const rows =
    await repository
      .getStockMovements();

  const year =
    currentYear();

  const refs =
    rows
      .map(
        r =>
          (
            r.refNo ||
            ""
          ).trim()
      )
      .filter(
        ref =>
          ref.startsWith(
            `RCOUT${year}`
          )
      );

  let next = 1;

  if (refs.length) {

    next =
      Math.max(
        ...refs.map(
          ref => {

            const seq =
              Number(
                ref
                  .split("-")[1]
              );

            return (
              seq || 0
            );

          }
        )
      ) + 1;

  }

  return (

    "RCOUT" +

    yyyymmdd() +

    "-" +

    String(
      next
    ).padStart(
      5,
      "0"
    )

  );

}

module.exports = {

  getMovementId,

  getRefNo

};