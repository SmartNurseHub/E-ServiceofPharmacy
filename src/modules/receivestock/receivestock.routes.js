console.log("✅ receivestock.routes loaded");
const router = require("express").Router();

const controller =
  require("./receivestock.controller");

/* =====================================================
GET ALL
===================================================== */
router.use((req, res, next) => {
  console.log("➡️", req.method, req.originalUrl);
  next();
});
router.get(
  "/",
  controller.getAllReceiveStock
);

/* =====================================================
CREATE
===================================================== */

router.post(
  "/",
  controller.createReceiveStock
);

/* =====================================================
GET REF NO
===================================================== */

router.get(
  "/refno",
  controller.getNextRefNo
);

/* =====================================================
GET INVENTORY MASTER
===================================================== */

router.get(
  "/master",
  controller.getInventoryMaster
);

module.exports = router;