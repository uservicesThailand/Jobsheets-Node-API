const { removeUndefined } = require("../../../../utils/object.util");

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
        coilBrakeTest.voltIncoming1,
        coilBrakeTest.voltIncoming2,
        coilBrakeTest.voltIncoming3,
      ],
      final: [
        coilBrakeTest.voltFinal1,
        coilBrakeTest.voltFinal2,
        coilBrakeTest.voltFinal3,
      ],
    },
    current: {
      incoming: [
        coilBrakeTest.currentIncoming1,
        coilBrakeTest.currentIncoming2,
        coilBrakeTest.currentIncoming3,
      ],
      final: [
        coilBrakeTest.currentFinal1,
        coilBrakeTest.currentFinal2,
        coilBrakeTest.currentFinal3,
      ],
    },
  };
};

module.exports = { mapPayload, mapResponse };
