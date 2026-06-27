const service = require("./dispense.service");
const running = require("./dispense.running");

// =====================
// UPLOAD
// =====================
exports.uploadDispenseZip = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: "No file uploaded"
      });
    }

    const result = await service.uploadDrugOpd(req.file.buffer);

    return res.json({
      ok: true,
      count: result.count
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      message: err.message
    });
  }
};

// =====================
// NEXT REF
// =====================
exports.getNextRefNo =
async (
  req,
  res
) => {

try {

const refNo =
await running.getRefNo();

return res.json({

ok:true,

refNo

});

}

catch(err){

console.error(
"NEXT REF ERROR:",
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

};

// =====================
// 🔥 FIX LIST API (สำคัญสุด)
// =====================
exports.getList = async (req, res) => {
  try {

    console.log("🔥 HIT /api/dispense");

    const data = await service.getList();

    console.log("📦 SERVICE RESULT =", data);

    res.json({
      ok: true,
      data
    });

  } catch (err) {
    console.error("❌ GET LIST ERROR:", err);

    res.status(500).json({
      ok: false,
      message: err.message
    });
  }
};


exports.getByRefNo = async (req, res) => {

  try {

    const data =
      await service.getByRefNo(req.params.refNo);

    if (!data) {

      return res.json({
        ok: false
      });

    }

    res.json({
      ok: true,
      data
    });

  } catch (err) {

    res.status(500).json({

      ok: false,

      message: err.message

    });

  }

};

exports.getStockMovement = async (req, res) => {

  try {

    const data = await service.getList();

    res.json({
      ok: true,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};

exports.createDispense = async (req, res) => {

  try {

    const data =
      await service.createDispense(
        req.body
      );

    return res.json({
      ok: true,
      data
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};

exports.updateDispense = async (req, res) => {

  try {

    const data =
      await service.updateDispense(
        req.params.refNo,
        req.body
      );

    return res.json({
      ok: true,
      data
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};

exports.deleteDispense = async (req, res) => {

  try {

    await service.deleteDispense(
      req.params.refNo
    );

    return res.json({
      ok: true
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};