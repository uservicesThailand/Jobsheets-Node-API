const { POSITION_INDEX } = require("./field.constants");

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
      afterDegree1: null,
    });
  }

  return rows;
};

const mergeWithPayload = (generatedRows = [], payloadRows = []) => {
  if (!Array.isArray(payloadRows) || payloadRows.length === 0) {
    return generatedRows;
  }

  const payloadMap = new Map(
    payloadRows.map((row) => [row.positionIndex, row])
  );

  return generatedRows.map((genRow) => {
    const payload = payloadMap.get(genRow.positionIndex);
    if (!payload) return genRow;

    return {
      ...genRow,
      ...payload,
    };
  });
};

module.exports = {
  generateAllCombos,
  mergeWithPayload,
};
