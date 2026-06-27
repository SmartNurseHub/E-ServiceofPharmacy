const express = require("express");
const router = express.Router();

const controller =
  require("./sticker.controller");

router.get(
  "/api/movement",
  controller.getMovement
);

module.exports = router;