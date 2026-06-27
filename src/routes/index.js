const express = require("express");
const app = express();

// =========================
// ROUTES
// =========================

app.use(
  "/api/receivedrug",
  require("../modules/receivedrug/receivedrug.routes")
);

app.use(
  "/api/drugbalance",
  require("../modules/drugbalance/drugbalance.routes")
);

app.use(
  "/api/dashboard",
  require(
    "../dashboard/summarydrug/sumdrugstock.routes"
  )
);

module.exports = app;