const { removeUndefined } = require("../../../utils/object.util");

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
    note: body.note,
  };

  return removeUndefined(payload);
};

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
    note: formCoilBrakeTest.note,
    power: {
      value: formCoilBrakeTest.powerValue,
      unit: formCoilBrakeTest.powerUnit,
    },
    speed: {
      value: formCoilBrakeTest.speedValue,
      unit: formCoilBrakeTest.speedUnit,
    },
    frequency: formCoilBrakeTest.frequency,
    current: formCoilBrakeTest.current,
    volt: formCoilBrakeTest.volt,
    eff: formCoilBrakeTest.eff,
    year: formCoilBrakeTest.year,
    weight: formCoilBrakeTest.weight,
    cos: formCoilBrakeTest.cos,
    brakeTypes: Array.isArray(coilBrakeTestTypes)
      ? coilBrakeTestTypes.map((item) => item.brakeTypeCode)
      : [],
  };
};

module.exports = { mapPayload, coilBrake };
