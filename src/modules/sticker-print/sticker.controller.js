const service =
  require("./sticker.service");

exports.getMovement = async (req, res) => {

  try {

    const data =
      await service.getMovement();

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