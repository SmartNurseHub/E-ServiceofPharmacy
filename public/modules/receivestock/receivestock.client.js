/* =====================================================
RECEIVE STOCK CLIENT (FIXED VERSION)
===================================================== */

/* =========================
DROPDOWN
========================= */
async function loadDrugDropdown() {

  try {

    const res =
      await fetch("/api/receivestock/master");

    if (!res.ok)
      throw new Error("โหลด master ไม่สำเร็จ");

    const json = await res.json();

    const rows =
      Array.isArray(json) ? json : json.data || [];

    const select =
      document.getElementById("drugSelectReceive");

    if (!select) return;

    select.innerHTML =
      `<option value="">เลือกยา</option>`;

    rows.forEach(r => {

      const code = r.code || r.CODE;
      const name = r.name || r.NAME;
      const unit = r.unit || r.UNIT;

      if (!code) return;

      const opt =
        document.createElement("option");

      opt.value = code;
      opt.textContent = `${code} - ${name}`;

      opt.dataset.name = name || "";
      opt.dataset.unit = unit || "";

      select.appendChild(opt);

    });

  } catch (err) {

    console.error("❌ dropdown:", err);

  }

}

/* =========================
TABLE
========================= */
async function loadReceiveStock() {

  const tbody =
    document.getElementById("receiveStockTable");

  if (!tbody) return;

  tbody.innerHTML =
    `<tr><td colspan="8">Loading...</td></tr>`;

  try {

    const res =
      await fetch("/api/receivestock");

    if (!res.ok)
      throw new Error("โหลด receive ไม่สำเร็จ");

    const json = await res.json();

    const rows =
      Array.isArray(json) ? json : json.data || [];

    if (!rows.length) {

      tbody.innerHTML =
        `<tr><td colspan="8">ไม่พบข้อมูล</td></tr>`;

      return;

    }

    tbody.innerHTML = rows.map(r => `

      <tr>

        <td>${r.DATE || "-"}</td>
        <td>${r.CODE || "-"}</td>
        <td>${r.NAME || "-"}</td>
        <td>${r.QTY || 0}</td>
        <td>${r.UNIT || "-"}</td>
        <td>${r.LOT || "-"}</td>
        <td>${r.EXP || "-"}</td>

        <td>
          ${r.QRCODE
            ? `<img src="${r.QRCODE}" width="60">`
            : "-"
          }
        </td>

      </tr>

    `).join("");

  } catch (err) {

    console.error("❌ table:", err);

  }

}

/* =========================
REF NO
========================= */
async function loadRefNo() {

  try {

    const res =
      await fetch("/api/receivestock/refno");

    const json =
      await res.json();

    const input =
      document.getElementById("receivestockNo");

    if (input) {

      input.value =
        json.refNo || "-";

    }

  } catch (err) {

    console.error("❌ refno:", err);

  }

}

/* =========================
SELECT BIND
========================= */
function bindDrugSelect() {

  const select =
    document.getElementById("drugSelectReceive");

  if (!select) return;

  select.addEventListener("change", () => {

    const opt =
      select.selectedOptions[0];

    const code =
      document.getElementById("code");

    const name =
      document.getElementById("name");

    const unit =
      document.getElementById("unit");

    if (code)
      code.value = opt?.value || "";

    if (name)
      name.value = opt?.dataset.name || "";

    if (unit)
      unit.value = opt?.dataset.unit || "";

  });

}

/* =========================
RESET FORM
========================= */
function resetForm() {

  const form =
    document.getElementById("receivestockForm");

  form?.reset();

  const code =
    document.getElementById("code");

  const name =
    document.getElementById("name");

  const unit =
    document.getElementById("unit");

  if (code) code.value = "";
  if (name) name.value = "";
  if (unit) unit.value = "";

}

/* =========================
MODAL
========================= */
function bindModal() {

  const modal =
    document.getElementById("ReceiveStockModal");

  const openBtn =
    document.getElementById("openReceiveStockModal");

  if (!modal || !openBtn) {

    console.warn("❌ modal/openBtn not found");
    return;

  }

  function close() {

    modal.classList.remove("active");
    resetForm();

  }

  openBtn.onclick = async () => {

    resetForm();

    modal.classList.add("active");

    const dateInput =
      document.querySelector(
        'input[name="dateIn"]'
      );

    if (dateInput) {

      dateInput.value =
        new Date()
          .toISOString()
          .split("T")[0];

    }

    await loadRefNo();

  };

  modal
    .querySelectorAll(".js-close-receive-modal")
    .forEach(btn => {

      btn.onclick = close;

    });

  modal.onclick = (e) => {

    if (e.target === modal) {

      close();

    }

  };

}

/* =========================
STICKER BUTTON
========================= */
function bindStickerButton() {

  const btn =
    document.getElementById("openStickerPrint");

  if (!btn) {

    console.warn("❌ openStickerPrint not found");
    return;

  }

  btn.addEventListener("click", () => {

    window.open(
      "/modules/sticker-print/sticker.view.html",
      "_blank"
    );

  });

}

/* =========================
SUBMIT + SWEETALERT
========================= */
function bindFormSubmit() {

  const form =
    document.getElementById("receivestockForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

      const payload =
        Object.fromEntries(
          new FormData(form)
        );

      Swal.fire({

        title: "กำลังบันทึก...",
        allowOutsideClick: false,

        didOpen: () => {

          Swal.showLoading();

        }

      });

      const res =
        await fetch("/api/receivestock", {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(payload)

        });

      const json =
        await res.json();

      if (!json.ok) {

        Swal.fire({

          icon: "error",
          title: "บันทึกไม่สำเร็จ"

        });

        return;

      }

      Swal.fire({

        icon: "success",
        title: "บันทึกสำเร็จ",
        timer: 1500,
        showConfirmButton: false

      });

      resetForm();

      modalClose();

      await loadReceiveStock();
      await loadRefNo();

    } catch (err) {

      console.error(err);

      Swal.fire({

        icon: "error",
        title: "เกิดข้อผิดพลาด"

      });

    }

  });

}

/* =========================
HELPER
========================= */
function modalClose() {

  document
    .getElementById("receiveStockModal")
    ?.classList.remove("active");

}

/* =========================
INIT
========================= */
export async function init() {

  console.log("🔥 RSM INIT");

  bindModal();

  bindDrugSelect();

  bindFormSubmit();

  bindStickerButton();

  await loadDrugDropdown();

  await loadReceiveStock();

  await loadRefNo();

}