// =====================
// UTIL
// =====================
function toDateInput(value) {
  if (!value) return "";
  if (value.includes("-")) return value;

  const [m, d, y] = value.split("/");
  if (!m || !d || !y) return "";

  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// =====================
// NORMALIZER (IMPORTANT FIX)
// =====================
function normalizeDispense(r) {
  return {
    refNo: r.refNo || r.REF_NO,
    type: r.type || r.TYPE,
    date: r.date || r.DATE || r.DATESERV,
    code: r.code || r.CODE,
    name: r.name || r.NAME || r.DNAME,
    qty: r.qty || r.QTY || r.AMOUNT,
    unit: r.unit || r.UNIT,
    lot: r.lot || r.LOT,
    exp: r.exp || r.EXP,

    // 🔥 FIX ตรงนี้
   supplier: r.target || r.TARGET || r.supplier || r.SUPPLIER || "",

    location: r.location || r.LOCATION
  };
}

// =====================
// EDIT MODE
// =====================
let isEditMode = false;
let currentRefNo = null;
// =====================
// INIT
// =====================
export async function init() {

  console.log("💊 DISPENSE MODULE");

  window.openDispenseModal = openDispenseModal;
  window.closeDispenseModal = closeDispenseModal;
  window.openDispenseById = openDispenseById;

  window.openDispenseUploadModal =
    openDispenseUploadModal;

  window.closeDispenseUploadModal =
    closeDispenseUploadModal;

  window.uploadDispenseFile =
    uploadDispenseFile;

  window.editDispense =
    editDispense;

  window.deleteDispense =
    deleteDispense;

  // 🔥 เพิ่มตรงนี้
  const form =
    document.getElementById("dispenseForm");

  if (form) {

    form.removeEventListener(
      "submit",
      submitDispenseForm
    );

    form.addEventListener(
      "submit",
      submitDispenseForm
    );

  }

  // โหลดรายการยา
  await loadDrugMaster();

  // เลือกยา → เติมชื่อ/หน่วย
  document.getElementById("drugSelect")
    .addEventListener("change", function () {

      const opt = this.selectedOptions[0];

      document.getElementById("name").value =
        opt?.dataset?.name || "";

      document.getElementById("unit").value =
        opt?.dataset?.unit || "";

      document.getElementById("lot").value =
        opt?.dataset?.lot || "";

      document.getElementById("exp").value =
        opt?.dataset?.exp || "";

    });

  await loadNextRefNo();
  await loadDispenseList();
}

// =====================
// MODAL
// =====================
async function openDispenseModal(isEdit = false) {

  const el =
    document.getElementById(
      "dispenseModal"
    );

  if (!el) return;

  el.classList.remove("hidden");
  el.classList.add("show");

  // NEW
if (!isEdit) {

  isEditMode = false;
  currentRefNo = null;

  document
    .getElementById(
      "dispenseForm"
    )
    ?.reset();

  await loadDrugMaster();

  await loadNextRefNo();

}

}


function closeDispenseModal() {
  const el = document.getElementById("dispenseModal");
  if (!el) return;

  el.classList.add("hidden");
  el.classList.remove("show");
}

// =====================
// UPLOAD MODAL
// =====================
function openDispenseUploadModal() {
  const el = document.getElementById("dispenseUploadModal");
  if (!el) return;

  el.classList.remove("hidden");
  el.classList.add("show");
}

function closeDispenseUploadModal() {
  const el = document.getElementById("dispenseUploadModal");
  if (!el) return;

  el.classList.add("hidden");
  el.classList.remove("show");
}

// =====================
// UPLOAD
// =====================
async function uploadDispenseFile() {

  const input = document.getElementById("dispenseZipFile");

  if (!input || !input.files.length) {
    alert("กรุณาเลือกไฟล์ก่อน");
    return;
  }

  const file = input.files[0];

  const formData = new FormData();
  formData.append("file", file);

  try {

    const res = await fetch("/api/dispense/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Upload ไม่สำเร็จ");
      return;
    }

    alert("Upload สำเร็จ");
    closeDispenseUploadModal();

    // 🔥 reload list หลัง upload
    await loadDispenseList();

  } catch (err) {
    console.error(err);
    alert("เกิด error upload");
  }
}

// =====================
// LIST (FIXED)
// =====================
async function loadDispenseList() {

  const tbody = document.getElementById("dispenseTable");
  if (!tbody) return;

  try {

    const res = await fetch("/api/dispense");
    const json = await res.json();

    if (!json.ok) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">โหลดข้อมูลไม่สำเร็จ</td>
        </tr>
      `;
      return;
    }

    if (!Array.isArray(json.data)) {
      console.error("API format invalid:", json);
      return;
    }

    // ✅ เรียงวันที่ล่าสุด -> เก่าสุด
const rows = json.data
  .map(normalizeDispense)

  // ✅ แสดงเฉพาะ TYPE = OUT
  .filter(r => (r.type || r.TYPE) === "OUT")

  // ✅ เรียงวันที่ล่าสุด -> เก่าสุด
  .sort((a, b) => {

    const da = Number(
      String(a.date || "").replaceAll("-", "")
    );

    const db = Number(
      String(b.date || "").replaceAll("-", "")
    );

    return db - da;

  });

    if (!rows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">ไม่มีข้อมูล</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = "";

    rows.forEach(r => {

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${r.date || ""}</td>
        <td>${r.code || ""}</td>
        <td>${r.name || ""}</td>
        <td>${r.qty || ""}</td>
        <td>${r.unit || ""}</td>
        <td>${r.lot || ""}</td>
        <td>${r.exp || ""}</td>

        <td>
          <div class="dsc-action-group">

            <button
              class="dsc-btn-action dsc-btn-view"
              title="รายละเอียด"
              onclick="openDispenseById('${r.refNo}')">
              👁️
            </button>

            <button
              class="dsc-btn-action dsc-btn-edit"
              title="แก้ไข"
              onclick="editDispense('${r.refNo}')">
              ✏️
            </button>

            <button
              class="dsc-btn-action dsc-btn-delete"
              title="ลบ"
              onclick="deleteDispense('${r.refNo}')">
              🗑️
            </button>

          </div>
        </td>
      `;

      tbody.appendChild(tr);

    });

  } catch (err) {

    console.error(err);

    tbody.innerHTML = `
      <tr>
        <td colspan="8">เกิด error โหลดข้อมูล</td>
      </tr>
    `;

  }

}

// =====================
// DETAIL
// =====================
async function openDispenseById(refNo) {

  const res = await fetch(`/api/dispense/${refNo}`);
  const json = await res.json();

  if (!json.ok) {
    alert("ไม่พบข้อมูล");
    return;
  }

  const d = json.data;

  alert(`
เลขที่ : ${d.refNo}

วันที่ : ${d.date}

รหัสยา : ${d.code}

ชื่อยา : ${d.name}

จำนวน : ${d.qty} ${d.unit}

LOT : ${d.lot}

EXP : ${d.exp}

ผู้รับ : ${d.target}

สถานที่ : ${d.location}
  `);
}

const waitEl = (id) =>
  new Promise(resolve => {
    const check = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      requestAnimationFrame(check);
    };
    check();
  });

  
async function editDispense(refNo) {

  const res = await fetch(`/api/dispense/${refNo}`);
  const json = await res.json();
  const wait = (id) =>
  new Promise(resolve => {
    const check = () => {
      const el = document.getElementById(id);
      if (el) return resolve(el);
      requestAnimationFrame(check);
    };
    check();
  });

  if (!json.ok) {
    alert("ไม่พบข้อมูล");
    return;
  }

const d = json.data;

isEditMode = true;
currentRefNo = refNo;

await openDispenseModal(true);

  if (typeof loadDrugMaster === "function") {
    await loadDrugMaster();
  }

  const [
    refNoEl,
    dateEl,
    drugEl,
    nameEl,
    qtyEl,
    unitEl,
    lotEl,
    expEl,
    supplierEl,
    userEl
  ] = await Promise.all([
    wait("refNo"),
    wait("dateIn"),
    wait("drugSelect"),
    wait("name"),
    wait("qty"),
    wait("unit"),
    wait("lot"),
    wait("exp"),
    wait("supplier"),
    wait("user")
  ]);

  // 🔥 debug ต้องอยู่ตรงนี้
  console.log("DRUG OPTIONS:", [...drugEl.options].map(o => o.value));
  console.log("TARGET CODE:", d.code);

  refNoEl.value = d.refNo || "";
  dateEl.value = toDateInput(d.date) || "";

  drugEl.value = d.code || "";

  nameEl.value = d.name || "";
  qtyEl.value = d.qty || "";
  unitEl.value = d.unit || "";

  lotEl.value = d.lot || "";
  expEl.value = toDateInput(d.exp) || "";

  supplierEl.value = d.target || "";
  userEl.value = d.user || "";
}

async function deleteDispense(refNo) {

  const ok = confirm(`ต้องการลบ ${refNo} ?`);

  if (!ok) return;

  try {

    const res = await fetch(
      `/api/dispense/${encodeURIComponent(refNo)}`,
      {
        method: "DELETE"
      }
    );

    const json = await res.json();

    if (!json.ok) {
      alert(json.message);
      return;
    }

    alert("ลบสำเร็จ");

    await loadDispenseList();

  } catch (err) {

    console.error(err);

    alert("เกิดข้อผิดพลาด");

  }

}
// =====================
// NEXT REF NO
// =====================
async function loadNextRefNo() {
  try {
    const res = await fetch("/api/dispense/next-refno");
    const json = await res.json();

    if (json.ok) {
      const input = document.getElementById("refNo");
      if (input) input.value = json.refNo;
    }
  } catch (err) {
    console.error("โหลดเลขที่จำหน่ายไม่สำเร็จ", err);
  }
}

async function loadDrugMaster() {

  const res = await fetch("/api/drug-master");
  const json = await res.json();

  const drugEl = document.getElementById("drugSelect");

  drugEl.innerHTML = `<option value="">-- เลือกยา --</option>`;

  if (!json.ok || !Array.isArray(json.data)) return;

  json.data.forEach(d => {

    const code = (d.CODE || d.code || "").trim();
    const name = (d.NAME || d.name || "").trim();
    const unit = (d.UNIT || d.unit || "").trim();
    const lot  = (d.LOT || d.lot || "").trim();
    const exp  = (d.EXP || d.exp || "").trim();

    if (!code) return; // 🔥 กัน option ว่าง

    const opt = document.createElement("option");

    opt.value = code;
    opt.textContent = `${code} - ${name} (LOT:${lot})`;

    opt.dataset.name = name;
    opt.dataset.unit = unit;
    opt.dataset.lot = lot;
    opt.dataset.exp = exp;

    drugEl.appendChild(opt);
  });
}

async function submitDispenseForm(e) {

  e.preventDefault();

  console.log("💾 SUBMIT DISPENSE");

  const payload = {
    refNo: document.getElementById("refNo")?.value || "",
    date: document.getElementById("dateIn")?.value || "",
    code: document.getElementById("drugSelect")?.value || "",
    name: document.getElementById("name")?.value || "",
    qty: document.getElementById("qty")?.value || "",
    unit: document.getElementById("unit")?.value || "",
    lot: document.getElementById("lot")?.value || "",
    exp: document.getElementById("exp")?.value || "",
    target: document.getElementById("supplier")?.value || "",
    user: document.getElementById("user")?.value || ""
  };

  try {

    const url =
      isEditMode
        ? `/api/dispense/${currentRefNo}`
        : "/api/dispense";

    const method =
      isEditMode
        ? "PUT"
        : "POST";

    console.log(
      "SAVE MODE:",
      isEditMode ? "UPDATE" : "CREATE"
    );

    console.log(
      "URL:",
      url
    );

    console.log(payload);

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    console.log(
      "SAVE RESULT:",
      json
    );

    if (!json.ok) {

      alert(
        json.message ||
        "บันทึกไม่สำเร็จ"
      );

      return;
    }

    alert(
      isEditMode
        ? "แก้ไขสำเร็จ"
        : "บันทึกสำเร็จ"
    );

    closeDispenseModal();

    isEditMode = false;
    currentRefNo = null;

    await loadDispenseList();

  }
  catch (err) {

    console.error(err);

    alert(
      "เกิดข้อผิดพลาดในการบันทึก"
    );

  }

}


// =====================
// DESTROY
// =====================
export function destroy() {

  delete window.openDispenseModal;
  delete window.closeDispenseModal;
  delete window.openDispenseById;

  delete window.openDispenseUploadModal;
  delete window.closeDispenseUploadModal;

  delete window.uploadDispenseFile;

  delete window.editDispense;
  delete window.deleteDispense;

  delete window.submitDispenseForm;

  isEditMode = false;
  currentRefNo = null;
}