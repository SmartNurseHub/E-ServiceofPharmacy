const runningService =
  require("@/utils/running/running.service");

const {
  MOVEMENT
} = require(
  "@/constants/running.constants"
);

async function generateMovementNo() {

  return await runningService.generate(
    MOVEMENT
  );

}

module.exports = {
  generateMovementNo
};