const { toNumberOrNull } = require("../../../utils/number.util");

const mapPayload = (body) => {
  const payload = {
    frame: body.frame ?? undefined,
    type: body.type ?? undefined,
    manufacture: body.manufacture ?? undefined,
    model: body.model ?? undefined,

    powerValue: body.power?.value ?? undefined,
    powerUnit: body.power?.unit ?? undefined,

    speedValue: body.speed?.value ?? undefined,
    speedUnit: body.speed?.unit ?? undefined,

    serialNo: body.serialNo ?? undefined,
    insulationClass: body.insulationClass ?? undefined,

    design: body.design ?? undefined,
    frequency: body.frequency ?? undefined,
    current: body.current ?? undefined,
    volt: body.volt ?? undefined,

    year: body.year ?? undefined,
    pe: body.pe ?? undefined,
    eff: body.eff ?? undefined,
    ip: body.ip ?? undefined,

    weight: body.weight ?? undefined,
    cos: body.cos ?? undefined,
  };

  return removeUndefined(payload);
};

const removeUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );

const coilBrake = ({ formCoilBrakeTest, coilBrakeTestTypes }) => {
  return {
    frame: formCoilBrakeTest.frame,
    type: formCoilBrakeTest.type,
    manufacture: formCoilBrakeTest.manufacture,
    model: formCoilBrakeTest.model,
    serialNo: formCoilBrakeTest.serialNo,
    design: formCoilBrakeTest.design,
    pe: formCoilBrakeTest.pe,
    ip: formCoilBrakeTest.ip,
    insulationClass: formCoilBrakeTest.insulationClass,
    power: {
      value: toNumberOrNull(formCoilBrakeTest.powerValue),
      unit: formCoilBrakeTest.powerUnit,
    },
    speed: {
      value: toNumberOrNull(formCoilBrakeTest.speedValue),
      unit: formCoilBrakeTest.speedUnit,
    },
    frequency: toNumberOrNull(formCoilBrakeTest.frequency),
    current: toNumberOrNull(formCoilBrakeTest.current),
    volt: toNumberOrNull(formCoilBrakeTest.volt),
    eff: toNumberOrNull(formCoilBrakeTest.eff),
    year: toNumberOrNull(formCoilBrakeTest.year),
    weight: toNumberOrNull(formCoilBrakeTest.weight),
    cos: toNumberOrNull(formCoilBrakeTest.cos),
    brakeTypes: Array.isArray(coilBrakeTestTypes)
      ? coilBrakeTestTypes.map((item) => item.brakeTypeCode)
      : [],
  };
};

module.exports = { mapPayload, coilBrake };
