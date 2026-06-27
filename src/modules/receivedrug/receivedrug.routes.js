const router = require("express").Router();
const controller = require("./receivedrug.controller");

router.get("/", controller.getList);
router.get("/running", controller.getRunningNo);
router.get("/drugs", controller.getDrugMaster);
router.post("/", controller.create);

module.exports = router;