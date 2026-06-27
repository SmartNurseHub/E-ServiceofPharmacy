const res = await fetch("/api/receivestock");

export async function getInventoryMaster() {

  const res = await fetch("/api/inventory-master")

  if (!res.ok) {
    throw new Error("โหลดข้อมูลยาไม่สำเร็จ");
  }

  const json = await res.json();

  return Array.isArray(json)
    ? json
    : json.data || json.rows || [];
}

export async function saveReceiveStock(payload) {

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return await res.json();
}

export async function getDrugMaster() {

  const res = await fetch("/api/dispense/master");

  return await res.json();
}
