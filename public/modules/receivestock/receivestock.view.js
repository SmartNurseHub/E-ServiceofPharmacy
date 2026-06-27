/* =====================================================
RECEIVE STOCK MODAL (FIXED)
===================================================== */

/* =========================
RESET FORM
========================= */
function resetReceiveForm() {

  const form =
    document.getElementById("receivestockForm");

  if (!form) return;

  form.reset();

  // hidden
  document.getElementById("code").value = "";

  // readonly
  document.getElementById("name").value = "";
  document.getElementById("unit").value = "";

  // select reset
  const select =
    document.getElementById("drugSelectReceive");

  if (select) {
    select.selectedIndex = 0;
  }

}

/* =========================
MODAL CONTROL
========================= */
async function bindReceiveStockModal() {

  const modal =
    document.getElementById("ReceiveStockModal");

  const openBtn =
    document.getElementById("openReceiveStockModal");

  if (!modal || !openBtn) return;

  // =========================
  // OPEN
  // =========================
  openBtn.onclick = async () => {

    resetReceiveForm(); // 🔥 สำคัญมาก

    modal.classList.add("active");

    // set date auto
    const date =
      document.querySelector('input[name="dateIn"]');

    if (date) {
      date.value =
        new Date().toISOString().split("T")[0];
    }

    // โหลดเลขรับใหม่
    if (typeof loadRefNo === "function") {
      await loadRefNo();
    }

  };

  // =========================
  // CLOSE FUNCTION
  // =========================
  function closeModal() {

    modal.classList.remove("active");

    resetReceiveForm(); // 🔥 สำคัญมาก

  }

  // =========================
  // CLOSE BUTTONS
  // =========================
  modal
    .querySelectorAll(
      ".js-close-receive-modal, .closeReceiveModal"
    )
    .forEach(btn => {
      btn.onclick = closeModal;
    });

  // =========================
  // BACKDROP CLICK
  // =========================
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };

  // =========================
  // ESC KEY
  // =========================
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  });

}