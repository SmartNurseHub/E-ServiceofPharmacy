const { SCHEMA } = require("./mapping.schema");

// ดึงค่าจากหลาย key
function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== "") {
      return row[k];
    }
  }
  return "";
}

// map เข้า schema กลาง
function mapToSchema(row, type) {
  const schema = SCHEMA[type];
  const out = {};

  for (const field in schema) {
    out[field] = pick(row, schema[field]);
  }

  return out;
}

module.exports = { mapToSchema };