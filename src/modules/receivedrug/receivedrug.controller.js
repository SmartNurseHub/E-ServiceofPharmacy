const service = require("./receivedrug.service");

exports.getList = async (req, res) => {
  try {

    const data = await service.getList();

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }
};

exports.getDrugMaster = async (req, res) => {
  try {

    const data = await service.getDrugMaster();

    res.json(data);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }
};

exports.getRunningNo = async (req, res) => {

  try {

    const runningNo =
      await service.getRunningNo();

    res.json({
      ok: true,
      runningNo
    });

  } catch (err) {

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};

exports.create = async (req, res) => {

  try {

    const result =
      await service.create(req.body);

    res.json({
      ok: true,
      result
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      ok: false,
      message: err.message
    });

  }

};