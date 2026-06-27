const API_URL = "/api/stock/balance";

export async function init() {

  console.log("📊 STOCK BALANCE INIT");

  await loadDrugDropdown();

  // ❗ เปิดหน้า = ว่างเท่านั้น
  renderTable([]);
  renderSummary({
    in: 0,
    out: 0,
    balance: 0,
    count: 0
  });

}


// =========================
// FETCH FROM SHEET
// =========================
async function loadStockBalance(drugCode = "") {

  let url = API_URL;

  if (drugCode) {
    url = `${API_URL}?code=${drugCode}`;
  }

  console.log("CALL:", url);

  const res = await fetch(url);
  const json = await res.json();

  console.log("RESULT:", json);

  renderSummary(json.data.summary);
  renderTable(json.data.rows);
}


// =========================
// DROPDOWN
// =========================
async function loadDrugDropdown() {

  try {

    const res = await fetch("/api/master");
    const drugs = await res.json();

    const select = document.getElementById("drugSelect");

    select.innerHTML =
      `<option value="">-- กรุณาเลือกยา --</option>`;

    drugs.forEach(drug => {

      select.insertAdjacentHTML(
        "beforeend",
        `
        <option value="${drug.code}">
          ${drug.code} - ${drug.name}
        </option>
        `
      );

    });

    // ✅ ใช้ onchange (แทน addEventListener กันซ้ำ event)
    select.onchange = async (e) => {

      const code = e.target.value;

      console.log("SELECTED CODE:", code);

      // ❗ ไม่เลือก = clear table
      if (!code) {

        console.log("CLEAR DATA");

        renderTable([]);
        renderSummary({
          in: 0,
          out: 0,
          balance: 0,
          count: 0
        });

        return;
      }

      // ❗ เลือกยา = filter
      await loadStockBalance(code);

    };

  } catch (err) {

    console.error(err);

  }

}


// =========================
// SUMMARY
// =========================
function renderSummary(summary = {}) {

  document.querySelector(".db-summary").innerHTML = `
    <div class="db-card">
      <span>รับเข้า</span>
      <strong>${summary.in || 0}</strong>
    </div>

    <div class="db-card">
      <span>จ่ายออก</span>
      <strong>${summary.out || 0}</strong>
    </div>

    <div class="db-card green">
      <span>คงเหลือ</span>
      <strong>${summary.balance || 0}</strong>
    </div>

    <div class="db-card blue">
      <span>รายการ</span>
      <strong>${summary.count || 0}</strong>
    </div>
  `;
}


// =========================
// TABLE
// =========================
function parseTarget(text = "") {

  const parts = text.trim().split(/\s+/);

  if (parts.length < 3) {
    return {
      name: text || "-",
      birth: "-",
      cid: "-"
    };
  }

  const cid = parts[parts.length - 1];
  const birth = parts[parts.length - 2];
  const name = parts.slice(0, parts.length - 2).join(" ");

  return {
    name,
    birth,
    cid
  };
}


function renderTable(rows = []) {

  const tbody = document.querySelector(".db-table tbody");

  if (!rows.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;opacity:0.5;">
          ไม่มีข้อมูล
        </td>
      </tr>
    `;
    return;
  }

  // 🔥 FIX: safe date sort
  rows = [...rows].sort((a, b) => {
    const da = (a.date || "").replaceAll("-", "");
    const db = (b.date || "").replaceAll("-", "");
    return Number(db) - Number(da);
  });

  tbody.innerHTML = rows.map(r => {

    const isIn = r.type === "IN";
    const t = parseTarget(r.target);

    return `
      <tr>

        <td>${r.date || "-"}</td>

        <td>
          <span class="badge ${isIn ? "in" : "out"}">
            ${isIn ? "รับเข้า" : "จ่ายออก"}
          </span>
        </td>

        <td style="white-space: normal; line-height: 1.4;">
          ${
            isIn
              ? `<div><b>Target :</b> ${r.target || "-"}</div>`
              : `
                <div><b>Name :</b> ${t.name || "-"}</div>
                <div><b>Birth :</b> ${t.birth || "-"}</div>
                <div><b>CID :</b> ${t.cid || "-"}</div>
              `
          }
        </td>

        <td>
          <div>${r.name || "-"}</div>
          <div><b>LOT :</b> ${r.lot || "-"}</div>
          <div><b>EXP :</b> ${r.exp || "-"}</div>
        </td>

        <td>${r.in || "-"}</td>
        <td>${r.out || "-"}</td>
        <td>${r.balance || 0}</td>

        <td>
          ${
            (() => {
              const raw = r.user || "-";

              if (raw === "-") return "-";

              if (r.type === "IN") {
                return `<b>ผู้รับเข้า</b> : ${raw}`;
              }

              const [doctor, staff] = raw.split("/").map(s => s.trim());

              return `
                <b>แพทย์ผู้สั่ง</b> : ${doctor || "-"}<br>
                <b>ผู้รับคำสั่ง</b> : ${staff || "-"}
              `;
            })()
          }
        </td>

        <td class="db-action">
          <button class="db-icon-btn edit-btn" data-id="${r.movementId}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>

          <button class="db-icon-btn delete-btn" data-id="${r.movementId}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>

      </tr>
    `;

  }).join("");
}