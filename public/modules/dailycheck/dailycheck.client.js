async function loadData() {

  const month = document.getElementById("monthSelect")?.value || 6;
  const year = document.getElementById("yearSelect")?.value || 2026;

  const res = await fetch(`/api/dailycheck?month=${month}&year=${year}`);

  const json = await res.json();



  const tbody = document.getElementById("tbody");

  tbody.innerHTML = "";

  json.data.forEach(item => {

    let row = "<tr>";

    row += `<td>${item.CODE}</td>`;
    row += `<td>${item.NAME}</td>`;
    row += `<td>${item.UNIT}</td>`;
    row += `<td>${item.REQUIRED}</td>`;

    const required = Number(item.REQUIRED || 0);

for (let i = 1; i <= 31; i++) {

  const value = item[i];

  let cls = "";

  if (value !== "" && value != null) {

    const actual = Number(value);

    if (actual === required) {

      cls = "bg-success";

    } else if (actual < required) {

      cls = "bg-danger";

    } else if (actual > required) {

      cls = "bg-warning";

    }

  }

  row += `<td class="${cls}">${value ?? ""}</td>`;

}

 row += "</tr>";

    tbody.insertAdjacentHTML("beforeend", row);

  });

}

export async function init() {

  console.log("✅ dailycheck init");
const monthSelect = document.getElementById("monthSelect");

if (monthSelect && monthSelect.options.length === 0) {

  for (let m = 1; m <= 12; m++) {

    const op = document.createElement("option");

    op.value = m;

    op.textContent = m;

    if (m === new Date().getMonth() + 1) {

      op.selected = true;

    }

    monthSelect.appendChild(op);

  }

}

const yearSelect = document.getElementById("yearSelect");

if (yearSelect && yearSelect.options.length === 0) {

  for (let y = 2025; y <= 2035; y++) {

    const op = document.createElement("option");

    op.value = y;

    op.textContent = y;

    if (y === new Date().getFullYear()) {

      op.selected = true;

    }

    yearSelect.appendChild(op);

  }

}
  await loadData();

  document
    .getElementById("monthSelect")
    ?.addEventListener("change", loadData);

  document
    .getElementById("yearSelect")
    ?.addEventListener("change", loadData);

}