// config/mapping.schema.js

const SCHEMA = {
  STOCK: {
    DATE: ["DATE", "DATESERV", "DUPDATE"],
    CODE: ["CODE", "DIDSTD"],
    NAME: ["NAME", "DNAME"],
    QTY: ["QTY", "AMOUNT"],
    UNIT: ["UNIT"],
    LOT: ["LOT"],
    EXP: ["EXP"]
  },

  MOVEMENT: {
    MOVEMENT_ID: ["MOVEMENT_ID"],
    TYPE: ["TYPE"],
    REF_NO: ["REF_NO"],
    DATE: ["DATE", "DATESERV", "TIME"],
    CODE: ["CODE"],
    NAME: ["NAME"],
    QTY: ["QTY"],
    UNIT: ["UNIT"],
    LOT: ["LOT"],
    EXP: ["EXP"],
    TARGET: ["TARGET"],
    USER: ["USER"],
    TIME: ["TIME"],
    REMARK: ["REMARK"],
    LOCATION: ["LOCATION", "Location"]
  }
};

module.exports = { SCHEMA };