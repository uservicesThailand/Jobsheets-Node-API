const { toNumberOrNull } = require("../../../utils/number.util");

const mapPayload = (body) => {
  const payload = {
    frame: body.frame,
    type: body.type,
    manufacture: body.manufacture,
    model: body.model,

    powerValue: body.power?.value,
    powerUnit: body.power?.unit,

    speedValue: body.speed?.value,
    speedUnit: body.speed?.unit,

    serialNo: body.serialNo,
    insulationClass: body.insulationClass,

    design: body.design,
    frequency: body.frequency,
    current: body.current,
    volt: body.volt,

    year: body.year,
    pe: body.pe,
    eff: body.eff,
    ip: body.ip,

    weight: body.weight,
    cos: body.cos,
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
