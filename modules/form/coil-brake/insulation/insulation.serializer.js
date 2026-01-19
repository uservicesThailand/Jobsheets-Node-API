const { removeUndefined } = require("../../../../utils/object.util");
const { toNumberOrNull } = require("../../../../utils/number.util");

const mapPayload = (body) => {
  const payload = {
    volt: body.volt,
    incomingValue: body.incoming?.value,
    incomingUnit: body.incoming?.unit,
    finalValue: body.final?.value,
    finalUnit: body.final?.unit,
  };

  return removeUndefined(payload);
};

const insulationTest = ({ insulationTest }) => {
  return {
    volt: insulationTest.volt,
    incoming: {
      value: toNumberOrNull(insulationTest.incomingValue),
      unit: insulationTest.incomingUnit,
    },
    final: {
      value: toNumberOrNull(insulationTest.finalValue),
      unit: insulationTest.finalUnit,
    },
  };
};

module.exports = { mapPayload, insulationTest };
