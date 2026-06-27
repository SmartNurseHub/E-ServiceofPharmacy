// ======================
// NORMALIZE KEY (SAFE + NO COLLISION)
// ======================
function normalizeKey(key) {
  return String(key || "")
    .replace(/^\uFEFF/, "")      // BOM FIX
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")         // ลบ space
    .replace(/[^A-Z0-9]/g, "");  // เอาเฉพาะ A-Z 0-9
}

// ======================
// DELIMITER DETECTION
// ======================
function detectDelimiter(line) {
  if (!line) return "|";
  if (line.includes("\t")) return "\t";
  if (line.includes("|")) return "|";
  if (line.split(",").length > 2) return ",";
  return "|";
}

// ======================
// SAFE SPLIT (CSV SAFE)
// ======================
function safeSplit(line, delimiter) {
  if (!line) return [];

  if (delimiter !== ",") {
    return line.split(delimiter);
  }

  const result = [];
  let current = "";
  let inQuote = false;

  for (let char of line) {
    if (char === '"') inQuote = !inQuote;
    else if (char === "," && !inQuote) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// ======================
// MAIN TABLE PARSER
// ======================
function parseTable(text, options = {}) {

  const lines = text
    .split(/\r?\n/)
    .map(v => v.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const delimiter = detectDelimiter(lines[0]);

  const header = safeSplit(lines[0], delimiter)
    .map(normalizeKey);

  console.log("HEADER =>", header);

  const rows = [];

  for (let i = 1; i < lines.length; i++) {

    const cols = safeSplit(lines[i], delimiter);

    const obj = {};

    header.forEach((h, index) => {
      obj[h] = String(cols[index] || "").trim();
    });

    // ======================
    // 🔥 GLOBAL ALIAS FIX
    // ======================

    // DRUG_OPD
    if (obj.DATESERV && !obj.DATE) {
      obj.DATE = obj.DATESERV;
    }

    if (obj.DATETIME && !obj.DATE) {
      obj.DATE = obj.DATETIME;
    }

    // PERSON fallback (ถ้ามีอนาคต)
    if (obj.BIRTH && !obj.BIRTHDATE) {
      obj.BIRTHDATE = obj.BIRTH;
    }

    rows.push(obj);
  }

  console.log("ROWS:", rows.length);

  if (rows.length) {
    console.log("SAMPLE:", rows[0]);
  }

  return rows;
}

// ======================
// EXPORT PARSERS
// ======================
function parseDrugOpd(text) {
  return parseTable(text);
}

function parsePerson(text) {
  return parseTable(text);
}

function parseAddress(text) {
  return parseTable(text);
}

// ======================
module.exports = {
  parseDrugOpd,
  parsePerson,
  parseAddress
};