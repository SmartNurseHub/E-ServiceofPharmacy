const dayjs = require("dayjs");


function formatRunning(prefix, number){

  const ym = dayjs().format("YYYYMM");

  return (
    prefix +
    ym +
    "-" +
    String(number).padStart(5,"0")
  );

}


module.exports = {
  formatRunning
};