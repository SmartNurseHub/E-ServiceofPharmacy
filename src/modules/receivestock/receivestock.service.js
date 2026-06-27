const repository = require("./receivestock.repository");

/* =========================
GET ALL (กัน null + sort)
========================= */
async function getAll() {
  const rows = await repository.getAllReceiveStock();

  return (rows || [])
    .filter(r => r.type === "IN")
    .sort((a, b) => new Date(b.dateIn) - new Date(a.dateIn));
}

/* =========================
CREATE (validate + กันพัง)
========================= */
async function create(data) {

  if (!data.code || !data.name || !data.qty) {
    throw new Error("ข้อมูลไม่ครบ");
  }

  const payload = {
    type: "IN",
    dateIn: data.dateIn || new Date().toISOString().slice(0, 10),
    code: data.code,
    name: data.name,
    qty: Number(data.qty) || 0,
    unit: data.unit || "",
    lot: data.lot || "",
    exp: data.exp || "",
    refNo: data.receivestockNo || await getNextRefNo(),
    supplier: data.supplier || "",
    user: data.user || ""
  };

  return repository.insertReceiveStock(payload);
}

/* =========================
NEXT REFNO (กัน empty + format จริง)
========================= */
async function getNextRefNo() {

  const rows = await repository.getAllReceiveStock();

  const receive = (rows || []).filter(r => r.type === "IN");

  if (receive.length === 0) {
    return "RCV-0001";
  }

  const last = receive
    .map(r => r.refNo)
    .filter(Boolean)
    .sort()
    .pop();

  const num = parseInt(last?.split("-")[1]) || 0;

  const next = num + 1;

  return `RCV-${String(next).padStart(4, "0")}`;
}

/* =========================
MASTER
========================= */
async function getInventoryMaster() {
  return repository.getInventoryMaster();
}

module.exports = {
  getAll,
  create,
  getNextRefNo,
  getInventoryMaster
};