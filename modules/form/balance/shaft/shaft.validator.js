const { decimalOptional } = require("../../../../utils/validator.util");
const { body } = require("express-validator");

const create = [
  decimalOptional("rotorWeight"),
  decimalOptional("diameterA"),
  decimalOptional("diameterB"),
  decimalOptional("diameterC"),
  decimalOptional("radius1"),
  decimalOptional("radius2"),
];

const createShaftBalance = [
  body("balancingSpeed").optional({ nullable: true }).isInt().withMessage("Invalid number"),
  decimalOptional("incomingWeightDe"),
  decimalOptional("incomingWeightNde"),
  decimalOptional("incomingPhaseDe"),
  decimalOptional("incomingPhaseNde"),
  decimalOptional("finalWeightDe"),
  decimalOptional("finalWeightNde"),
  decimalOptional("finalPhaseDe"),
  decimalOptional("finalPhaseNde"),
];

module.exports = {
  create,
  createShaftBalance,
};
