async function loadData() {

  try {

    const res =
      await fetch("/sticker-print/api/movement");

    const json =
      await res.json();

    console.log("API =", json);

    const data =
      json?.data || [];

    render(data);

  } catch (err) {
    console.error(err);
  }

}

function render(data) {

  const container =
    document.getElementById("stickerContainer");

  if (!container) return;

  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>ไม่มีข้อมูล</p>";
    return;
  }

  data.forEach(item => {

    const qr =
  item.QRCODE ||
  `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(item.CODE + "|" + item.LOT)}`;

    const div = document.createElement("div");

    div.className = "sticker";

    div.innerHTML = `
      <div class="left">
        <div class="code">${item.CODE || "-"}</div>
        <div class="name">${item.NAME || "-"}</div>
        <div class="lot">LOT: ${item.LOT || "-"}</div>
        <div class="exp">EXP: ${item.EXP || "-"}</div>
      </div>

      <div class="right">
        <img class="qr" src="${qr}" />
        <div class="provider">${item.USER || "-"}</div>
      </div>
    `;

    container.appendChild(div);

  });

}

document
  .getElementById("printBtn")
  ?.addEventListener("click", () => window.print());

loadData();