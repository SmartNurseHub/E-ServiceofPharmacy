export async function init() {

  console.log(
    "💊 Receive Drug Module Loaded"
  );

  document
  .getElementById("receiveForm")
  ?.addEventListener(
    "submit",
    saveReceive
  );

  window.showDetail =
  showDetail;

  window.closeDetailModal =
  closeDetailModal;

  window.openReceiveModal =
    openReceiveModal;

  window.closeReceiveModal =
    closeReceiveModal;

  await loadDrugMaster();

  bindDrugSelect();
  await loadReceiveList();

}

function openReceiveModal() {

  document
    .getElementById("receiveModal")
    .classList.add("show");

  loadRunningNo();

}

function closeReceiveModal() {

  document
    .getElementById("receiveModal")
    ?.classList.remove("show");

}

export async function destroy() {

  delete window.openReceiveModal;
  delete window.closeReceiveModal;
  delete window.showDetail;
  delete window.closeDetailModal;

}

async function loadDrugMaster() {

  const res =
    await fetch("/api/receivedrug/drugs");

  const drugs =
    await res.json();

  const select =
    document.getElementById("drugSelect");

  select.innerHTML =
    `<option value="">-- เลือกยา --</option>`;

  drugs.forEach(drug => {

    select.innerHTML += `
      <option
        value="${drug.CODE}"
        data-name="${drug.NAME}"
        data-unit="${drug.UNIT}">
        ${drug.CODE} - ${drug.NAME}
      </option>
    `;

  });

}

function bindDrugSelect() {

  const select =
    document.getElementById("drugSelect")
.addEventListener("change", function () {

  const opt = this.selectedOptions[0];

  document.getElementById("name").value =
    opt?.dataset?.name || "";

  document.getElementById("unit").value =
    opt?.dataset?.unit || "";

  document.getElementById("lot").value =
    opt?.dataset?.lot || "";   // 👈 เพิ่ม

  document.getElementById("exp").value =
    opt?.dataset?.exp || "";   // 👈 เพิ่ม
});
}

async function loadRunningNo() {

  const res =
    await fetch(
      "/api/receivedrug/running"
    );

  const data =
    await res.json();

  document.getElementById(
    "receiveNo"
  ).value =
    data.runningNo;

}

async function loadReceiveList() {

  const res =
    await fetch("/api/receivedrug");

  const rows =
    await res.json();

  const tbody =
    document.getElementById("receiveTable");

  tbody.innerHTML = "";

  rows.forEach(row => {

    tbody.innerHTML += `
      <tr>
        <td>${row.DATE || ""}</td>
        <td>${row.RECEIVE_NO || ""}</td>
        <td>${row.NAME || ""}</td>
        <td>${row.QTY || ""}</td>
        <td>${row.UNIT || ""}</td>
        <td>${row.LOT || ""}</td>
        <td>${row.EXP || ""}</td>
        <td>
          <button
            class="psc-btn psc-btn-light"
            onclick='showDetail(${JSON.stringify(row)})'>
            ดู
          </button>
        </td>
      </tr>
    `;

  });

}

async function saveReceive(e) {

  e.preventDefault();

  const form =
    document.getElementById("receiveForm");

  const formData =
    new FormData(form);

  const payload =
    Object.fromEntries(
      formData.entries()
    );

  const res =
    await fetch(
      "/api/receivedrug",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify(payload)
      }
    );

  const result =
    await res.json();

  if (!result.ok) {

    alert(
      result.message ||
      "บันทึกไม่สำเร็จ"
    );

    return;
  }

  alert("บันทึกสำเร็จ");

  closeReceiveModal();

  form.reset();

  await loadReceiveList();

}

function showDetail(row) {

  document
    .getElementById("detailContent")
    .innerHTML = `

      <div><b>เลขที่รับเข้า:</b> ${row.RECEIVE_NO}</div>
      <div><b>รหัสยา:</b> ${row.CODE}</div>
      <div><b>ชื่อยา:</b> ${row.NAME}</div>
      <div><b>จำนวน:</b> ${row.QTY}</div>
      <div><b>หน่วย:</b> ${row.UNIT}</div>
      <div><b>LOT:</b> ${row.LOT}</div>
      <div><b>EXP:</b> ${row.EXP}</div>
      <div><b>Supplier:</b> ${row.SUPPLIER}</div>
      <div><b>User:</b> ${row.USER}</div>

    `;

  document
    .getElementById("detailModal")
    .classList.add("show");

}

function closeDetailModal() {

  document
    .getElementById("detailModal")
    .classList.remove("show");

}