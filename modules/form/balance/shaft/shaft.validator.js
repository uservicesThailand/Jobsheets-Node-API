const { decimalOptional } = require("../../../../utils/validator.util");

const create = [
  decimalOptional("rotorWeight"),
  decimalOptional("diameterA"),
  decimalOptional("diameterB"),
  decimalOptional("diameterC"),
  decimalOptional("radius1"),
  decimalOptional("radius2"),
];

module.exports = {
  create,
};
