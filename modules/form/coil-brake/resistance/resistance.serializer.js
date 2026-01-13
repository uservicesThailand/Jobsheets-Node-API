const { removeUndefined } = require("../../../../utils/object.util");
const { toNumberOrNull } = require("../../../../utils/number.util");

const mapPayload = ({ marking, incoming, final }) => {
  const payload = {
    marking1: marking?.[0],
    marking2: marking?.[1],
    marking3: marking?.[2],

    incoming1: incoming?.values?.[0],
    incoming2: incoming?.values?.[1],
    incoming3: incoming?.values?.[2],
    incomingUnit: incoming?.unit,

    final1: final?.values?.[0],
    final2: final?.values?.[1],
    final3: final?.values?.[2],
    finalUnit: final?.unit,
  };

  return removeUndefined(payload);
};

const resistanceTest = ({ resistanceTest }) => {
  return {
    marking: [
      toNumberOrNull(resistanceTest.marking1),
      toNumberOrNull(resistanceTest.marking2),
      toNumberOrNull(resistanceTest.marking3),
    ],

    incoming: {
      values: [
        toNumberOrNull(resistanceTest.incoming1),
        toNumberOrNull(resistanceTest.incoming2),
        toNumberOrNull(resistanceTest.incoming3),
      ],
      unit: resistanceTest.incomingUnit,
    },

    final: {
      values: [
        toNumberOrNull(resistanceTest.final1),
        toNumberOrNull(resistanceTest.final2),
        toNumberOrNull(resistanceTest.final3),
      ],
      unit: resistanceTest.finalUnit,
    },
  };
};

module.exports = { mapPayload, resistanceTest };
