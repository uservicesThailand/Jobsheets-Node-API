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
    beforeUnbalance: item.beforeUnbalance,
    beforeDegree1: item.beforeDegree1,
    beforeWeight: item.beforeWeight,
    beforeDegree2: item.beforeDegree2,
    afterUnbalance: item.afterUnbalance,
    afterDegree1: item.afterDegree1,
    afterWeight: item.afterWeight,
    afterDegree2: item.afterDegree2,
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
