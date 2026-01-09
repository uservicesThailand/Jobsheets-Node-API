const {
  decimalOptional,
  enumOptional,
  enumRequired,
  stringOptional,
  arrayMaxLength,
} = require("../../../../utils/validator.util");

const {
  ROTOR_TYPES,
  INCLUDE_WITH,
  PHASES,
  SIDES,
  POINTS_BY_SIDE,
  POSITIONS,
  RESULT,
} = require("./rotor.constants");

const ALL_POINTS = [...POINTS_BY_SIDE.DE, ...POINTS_BY_SIDE.NDE];

const createRotor = [
  enumOptional("rotorType", ROTOR_TYPES),
  enumOptional("includeWith", INCLUDE_WITH),

  decimalOptional("rotorWeight"),
  decimalOptional("diameterA"),
  decimalOptional("diameterB"),
  decimalOptional("diameterC"),
  decimalOptional("radius1"),
  decimalOptional("radius2"),
  decimalOptional("rotorSpeed"),

  stringOptional("note", { max: 500 }),
];

const createRotorBalance = [
  decimalOptional("incomingWeightDe"),
  decimalOptional("incomingAngleDe"),
  decimalOptional("incomingWeightNde"),
  decimalOptional("incomingAngleNde"),
  decimalOptional("finalWeightDe"),
  decimalOptional("finalAngleDe"),
  decimalOptional("finalWeightNde"),
  decimalOptional("finalAngleNde"),
  decimalOptional("stdToleranceDe"),
  decimalOptional("stdToleranceNde"),
];

const createRotorRunout = [
  arrayMaxLength(80),

  enumRequired("data.*.phase", PHASES),
  enumRequired("data.*.side", SIDES),
  enumRequired("data.*.point", ALL_POINTS),
  enumRequired("data.*.position", POSITIONS),

  decimalOptional("data.*.value"),
];

const createRotorRunoutResult = [
  arrayMaxLength(2),

  enumRequired("data.*.phase", PHASES),
  enumRequired("data.*.result", RESULT),
];

module.exports = {
  createRotor,
  createRotorBalance,
  createRotorRunout,
  createRotorRunoutResult,
};
