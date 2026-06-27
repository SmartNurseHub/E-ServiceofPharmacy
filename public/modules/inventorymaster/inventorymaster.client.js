/* =====================================================
INIT
===================================================== */
export async function init() {
  console.log("🔥 INVENTORY INIT");

  hideSummary();        // (ถ้าต้องการซ่อน summary)
  bindModalEvents();    // bind modal
  await loadInventoryMaster(); // โหลดตาราง
}

/* =====================================================
HIDE SUMMARY
===================================================== */
function hideSummary() {
  const summary = document.querySelector(".summary-grid");
  if (summary) summary.style.display = "none";
}

/* =====================================================
MODAL
===================================================== */
function bindModalEvents() {

  const modal = document.getElementById("inventoryModal");
  const openBtn = document.getElementById("openAddInventoryModal");
  const closeBtn = document.getElementById("closeInventoryModalBtn");
  const cancelBtn = document.getElementById("cancelInventoryModal");

  if (!modal) return;

  // OPEN
  openBtn?.addEventListener("click", () => {
    modal.classList.add("active");
  });

  // CLOSE
  function closeModal() {
    modal.classList.remove("active");
  }

  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

/* =====================================================
LOAD INVENTORY MASTER
===================================================== */
async function loadInventoryMaster() {

  const tbody = document.getElementById("inventoryMasterTable");
  if (!tbody) return;

  tbody.innerHTML = `
    <tr><td colspan="5">Loading...</td></tr>
  `;

  try {

    const res = await fetch("/api/inventory-master");

    if (!res.ok) {
      throw new Error("API ERROR");
    }

    const json = await res.json();

    const rows = Array.isArray(json)
      ? json
      : json.data || json.rows || [];

    console.log("INVENTORY =", rows);

    if (!rows.length) {
      tbody.innerHTML = `
        <tr><td colspan="5">ไม่พบข้อมูล</td></tr>
      `;
      return;
    }

    tbody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.CODE || r.code || "-"}</td>
        <td>${r.NAME || r.name || "-"}</td>
        <td>${r.UNIT || r.unit || "-"}</td>
        <td>${r.REQUIRED || r.required || 0}</td>
        <td>
          <button class="icon-btn">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn danger">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");

  } catch (err) {

    console.error("โหลด inventory error:", err);

    tbody.innerHTML = `
      <tr><td colspan="5">โหลดข้อมูลไม่สำเร็จ</td></tr>
    `;
  }
}