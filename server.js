require("dotenv").config();
require("module-alias/register");

const express = require("express");
const path = require("path");

const app = express();

/* =====================================================
 * SECURITY / CORE MIDDLEWARE
===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================================
 * API ROUTER IMPORTS
===================================================== */
const inventoryMasterRoutes =
require(
"./src/modules/inventorymaster/inventorymaster.routes"
);

const receiveStockRoutes =
require(
"./src/modules/receivestock/receivestock.routes"
);

const dispenseRoutes =
require(
"./src/modules/dispense/dispense.routes"
);

const drugbalanceRoutes =
require(
"./src/modules/drugbalance/drugbalance.routes"
);

const repository =
require(
"./src/modules/dispense/dispense.repository"
);
/* =====================================================
 * API ROUTES (ALL API FIRST)
===================================================== */

// Inventory
app.use("/api/inventory-master", inventoryMasterRoutes);

// Receive stock
app.use("/api/receive-stock", receiveStockRoutes);

// Dispense
app.use("/api/dispense", dispenseRoutes);

// Receivestock (duplicate path OK butควร cleanup ภายหลัง)
app.use(
  "/api/receivestock",
  require("./src/modules/receivestock/receivestock.routes")
);

// Receivedrug
app.use(
  "/api/receivedrug",
  require("./src/modules/receivedrug/receivedrug.routes")
);

// Dailycheck
app.use(
  "/api/dailycheck",
  require("./src/modules/dailycheck/dailycheck.routes")
);

/* =====================================================
 * ✅ FIX: STOCK BALANCE API (ตัวที่คุณหา)
===================================================== */
app.use("/api", drugbalanceRoutes);

/* =====================================================
 * Sticker print
===================================================== */
app.use(
  "/modules/sticker-print",
  express.static(path.join(__dirname, "src/modules/sticker-print"))
);

app.use(
  "/api/sticker-print",
  require("./src/modules/sticker-print/sticker.routes")
);


app.get(
"/api/drug-master",

async (
req,
res
)=>{

try{

const rows =
await repository.getDrugReceive();

return res
.json({

ok:true,

data:rows

});

}

catch(err){

console.error(
err
);

return res
.status(500)
.json({

ok:false,

message:
err.message

});

}

});

/* =====================================================
 * API 404 HANDLER (ต้องอยู่หลัง route ทั้งหมด)
===================================================== */
app.use("/api", (req, res) => {
  res.status(404).json({
    ok: false,
    message: `API not found: ${req.originalUrl}`
  });
});

/* =====================================================
 * STATIC FILES
===================================================== */
app.use(express.static(path.join(__dirname, "public")));

/* =====================================================
 * SPA FALLBACK (NON-API ONLY)
===================================================== */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =====================================================
 * GLOBAL ERROR HANDLER
===================================================== */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(500).json({
    ok: false,
    message: "Internal Server Error"
  });
});

/* =====================================================
 * START SERVER
===================================================== */
const PORT = process.env.PORT || 2005;

app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});