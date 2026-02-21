const { POSITION_INDEX, LOCATION } = require("./field.constants");

const generateAllCombos = (balanceFieldId) => {
  const rows = [];

  for (const positionIndex of POSITION_INDEX) {
    rows.push({
      balanceFieldId,
      positionIndex,
      positionName: null,
      beforeUnbalance: null,
      beforeDegree1: null,
      beforeWeight: null,
      beforeDegree2: null,
      afterUnbalance: null,
      afterDegree1: null,
      afterWeight: null,
      afterDegree2: null,
    });
  }

  return rows;
};

const mergeByKey = (generatedRows = [], payloadRows = [], key) => {
  if (!Array.isArray(payloadRows) || payloadRows.length === 0) {
    return generatedRows;
  }

  const payloadMap = new Map(payloadRows.map((row) => [row[key], row]));

  return generatedRows.map((genRow) => {
    const payload = payloadMap.get(genRow[key]);
    if (!payload) return genRow;

    return {
      ...genRow,
      ...payload,
    };
  });
};

const generateAllLocation = (balanceFieldId) => {
  const rows = [];

  for (const location of LOCATION) {
    rows.push({
      balanceFieldId,
      location,
      beforeH: null,
      beforeV: null,
      beforeA: null,
      afterH: null,
      afterV: null,
      afterA: null,
    });
  }

  return rows;
};

module.exports = {
  generateAllCombos,
  mergeByKey,
  generateAllLocation,
};
