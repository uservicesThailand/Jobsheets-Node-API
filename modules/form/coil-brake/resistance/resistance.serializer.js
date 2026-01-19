const { removeUndefined } = require("../../../../utils/object.util");

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
      resistanceTest.marking1,
      resistanceTest.marking2,
      resistanceTest.marking3,
    ],

    incoming: {
      values: [
        resistanceTest.incoming1,
        resistanceTest.incoming2,
        resistanceTest.incoming3,
      ],
      unit: resistanceTest.incomingUnit,
    },

    final: {
      values: [
        resistanceTest.final1,
        resistanceTest.final2,
        resistanceTest.final3,
      ],
      unit: resistanceTest.finalUnit,
    },
  };
};

module.exports = { mapPayload, resistanceTest };
