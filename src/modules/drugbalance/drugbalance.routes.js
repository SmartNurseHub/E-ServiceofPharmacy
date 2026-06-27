const router = require("express").Router();
const controller = require("./drugbalance.controller");

router.get("/stock/balance", controller.getStockBalance);

router.get("/master", controller.getDrugMaster);

module.exports = router;