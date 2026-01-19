const { removeUndefined } = require("../../../../utils/object.util");

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
      value: insulationTest.incomingValue,
      unit: insulationTest.incomingUnit,
    },
    final: {
      value: insulationTest.finalValue,
      unit: insulationTest.finalUnit,
    },
  };
};

module.exports = { mapPayload, insulationTest };
