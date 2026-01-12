const { toNumberOrNull } = require("../../../../utils/number.util");

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
    beforeUnbalance: toNumberOrNull(item.beforeUnbalance),
    beforeDegree1: toNumberOrNull(item.beforeDegree1),
    beforeWeight: toNumberOrNull(item.beforeWeight),
    beforeDegree2: toNumberOrNull(item.beforeDegree2),
    afterUnbalance: toNumberOrNull(item.afterUnbalance),
    afterDegree1: toNumberOrNull(item.afterDegree1),
    afterWeight: toNumberOrNull(item.afterWeight),
    afterDegree2: toNumberOrNull(item.afterDegree2),
  }));
};

const fieldLocations = ({ fieldLocations }) => {
  return fieldLocations.map((item) => ({
    location: item.location,
    beforeH: toNumberOrNull(item.beforeH),
    beforeV: toNumberOrNull(item.beforeV),
    beforeA: toNumberOrNull(item.beforeA),
    afterH: toNumberOrNull(item.afterH),
    afterV: toNumberOrNull(item.afterV),
    afterA: toNumberOrNull(item.afterA),
  }));
};

module.exports = {
  field,
  fieldPositions,
  fieldLocations,
};
