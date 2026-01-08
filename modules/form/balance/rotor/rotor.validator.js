const { body } = require("express-validator");

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

// 🔧 helpers
const decimalOptional = (field) =>
  body(field).optional({ nullable: true }).isDecimal({ decimal_digits: "0,2" });

const createRotor = [
  body("rotorType").optional({ nullable: true }).isIn(ROTOR_TYPES),
  body("includeWith").optional({ nullable: true }).isIn(INCLUDE_WITH),

  decimalOptional("rotorWeight"),
  decimalOptional("diameterA"),
  decimalOptional("diameterB"),
  decimalOptional("diameterC"),
  decimalOptional("radius1"),
  decimalOptional("radius2"),
  decimalOptional("rotorSpeed"),

  body("note").optional({ nullable: true }).isString().notEmpty().trim(),
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
  body("data").isArray(),

  body("data.*.phase").isIn(PHASES),
  body("data.*.side").isIn(SIDES),
  body("data.*.point").isIn(ALL_POINTS),
  body("data.*.position").isIn(POSITIONS),

  decimalOptional("data.*.value"),
];

const createRotorRunoutResult = [
  body("data").isArray(),

  body("data.*.phase").isIn(PHASES),
  body("data.*.result").isIn(RESULT),
];

module.exports = {
  createRotor,
  createRotorBalance,
  createRotorRunout,
  createRotorRunoutResult,
};
