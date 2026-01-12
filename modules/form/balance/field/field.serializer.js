const field = ({ balanceField }) => {
  return {
    checkResult: balanceField.checkResult || null,
    note: balanceField.note || null,
  };
};

const fieldPositions = ({ fieldPositions }) => {
  return fieldPositions.map((item) => ({
    positionIndex: item.positionIndex,
    positionName: item.positionName || null,
    beforeUnbalance: item.beforeUnbalance || null,
    beforeDegree1: item.beforeDegree1 || null,
    beforeWeight: item.beforeWeight || null,
    beforeDegree2: item.beforeDegree2 || null,
    afterUnbalance: item.afterUnbalance || null,
    afterDegree1: item.afterDegree1 || null,
    afterWeight: item.afterWeight || null,
  }));
};

const fieldLocations = ({ fieldLocations }) => {
  return fieldLocations.map((item) => ({
    location: item.location,
    beforeH: item.beforeH,
    beforeV: item.beforeV,
    beforeA: item.beforeA,
    afterH: item.afterH,
    afterV: item.afterV,
    afterA: item.afterA,
  }));
};

module.exports = {
  field,
  fieldPositions,
  fieldLocations,
};
