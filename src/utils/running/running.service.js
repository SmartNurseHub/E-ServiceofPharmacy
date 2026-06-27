const repo =
  require("./running.repository");

function pad(
  num,
  size = 5
) {

  return String(num)
    .padStart(size, "0");

}

function getYYYYMM() {

  const now =
    new Date();

  const yyyy =
    now.getFullYear();

  const mm =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  return `${yyyy}${mm}`;

}

async function generate(
  prefix
) {

  const ym =
    getYYYYMM();

  const key =
    `${prefix}${ym}`;

  // ======================
  // SELECT COLUMN
  // ======================
  const range =
    prefix === "MOV"
      ? "STOCK_MOVEMENT!A:A"
      : "STOCK_MOVEMENT!C:C";

  const values =
    await repo.getColumnValues(
      range
    );

  // ======================
  // FILTER PREFIX
  // ======================
  const matched =
    values.filter(v =>
      String(v)
        .startsWith(key)
    );

  // ======================
  // FIND MAX RUNNING
  // ======================
  let max = 0;

  for (const value of matched) {

    const parts =
      String(value).split("-");

    const running =
      Number(parts[1] || 0);

    if (running > max) {
      max = running;
    }

  }

  const next =
    max + 1;

  return `${key}-${pad(next)}`;

}

module.exports = {

  generate,

  generateRunningNumber:
    generate

};