const { removeUndefined } = require("../../../../utils/object.util");
const { toNumberOrNull } = require("../../../../utils/number.util");

const mapPayload = ({ volt, current }) => {
  const payload = {
    voltIncoming1: volt?.incoming?.[0],
    voltIncoming2: volt?.incoming?.[1],
    voltIncoming3: volt?.incoming?.[2],

    voltFinal1: volt?.final?.[0],
    voltFinal2: volt?.final?.[1],
    voltFinal3: volt?.final?.[2],

    currentIncoming1: current?.incoming?.[0],
    currentIncoming2: current?.incoming?.[1],
    currentIncoming3: current?.incoming?.[2],

    currentFinal1: current?.final?.[0],
    currentFinal2: current?.final?.[1],
    currentFinal3: current?.final?.[2],
  };

  return removeUndefined(payload);
};

const mapResponse = ({ coilBrakeTest }) => {
  return {
    volt: {
      incoming: [
        toNumberOrNull(coilBrakeTest.voltIncoming1),
        toNumberOrNull(coilBrakeTest.voltIncoming2),
        toNumberOrNull(coilBrakeTest.voltIncoming3),
      ],
      final: [
        toNumberOrNull(coilBrakeTest.voltFinal1),
        toNumberOrNull(coilBrakeTest.voltFinal2),
        toNumberOrNull(coilBrakeTest.voltFinal3),
      ],
    },
    current: {
      incoming: [
        toNumberOrNull(coilBrakeTest.currentIncoming1),
        toNumberOrNull(coilBrakeTest.currentIncoming2),
        toNumberOrNull(coilBrakeTest.currentIncoming3),
      ],
      final: [
        toNumberOrNull(coilBrakeTest.currentFinal1),
        toNumberOrNull(coilBrakeTest.currentFinal2),
        toNumberOrNull(coilBrakeTest.currentFinal3),
      ],
    },
  };
};

module.exports = { mapPayload, mapResponse };
