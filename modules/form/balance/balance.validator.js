const { body } = require("express-validator");

const ROTOR_TYPES = ["N/A", "AC ROTOR", "DC ROTOR", "GEN ROTOR", "FAN/BLOWER"];
const INCLUDE_WITH = [
  "N/A",
  "Couping",
  "Pulley",
  "Cooling Fan",
  "Key",
  "Impeller",
];

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

module.exports = {
  createRotor,
  createRotorBalance,
};
