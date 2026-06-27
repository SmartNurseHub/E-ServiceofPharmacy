const router = require("express").Router();
const controller = require("./dispense.controller");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.get("/", controller.getList);

router.get("/stock-movement", controller.getStockMovement);

router.get("/next-refno", controller.getNextRefNo);

router.get("/:refNo", controller.getByRefNo);

router.post(
  "/upload",
  upload.single("file"),
  controller.uploadDispenseZip
);

router.post("/", controller.createDispense);

router.put(
  "/:refNo",
  controller.updateDispense
);

router.delete(
  "/:refNo",
  controller.deleteDispense
);

module.exports = router;