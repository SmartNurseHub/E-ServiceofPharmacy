console.log("modal.js loaded");
window.addEventListener("click", (e) => {

  const modal = document.getElementById("receiveModal");

  if (e.target === modal) {
    window.closeReceiveModal();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    window.closeReceiveModal();
  }
});


window.openDispenseUploadModal = function () {

  const modal =
    document.getElementById(
      "dispenseUploadModal"
    );

  if (!modal) {

    console.error(
      "ไม่พบ dispenseUploadModal"
    );

    return;
  }

  modal.classList.remove("hidden");

};

window.closeDispenseUploadModal = function () {

  const modal =
    document.getElementById(
      "dispenseUploadModal"
    );

  if (!modal) return;

  modal.classList.add("hidden");

};

window.closeDispenseUploadModal = function () {

  document
    .getElementById("dispenseUploadModal")
    .classList.add("hidden");

};