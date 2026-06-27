const repository =
  require("./sticker.repository");

exports.getMovement = async () => {

  return await repository.getMovement();

};