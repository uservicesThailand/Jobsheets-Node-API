const {
  decimalOptional,
  enumOptional,
  arrayMaxLengthOpt,
} = require("../../../../utils/validator.util");

const { UNIT } = require("../insulation/insulation.constants");

const create = [
  arrayMaxLengthOpt({ min: 3, max: 3 }, "marking"),
  decimalOptional("marking.*"),

  arrayMaxLengthOpt({ min: 3, max: 3 }, "incoming.values"),
  decimalOptional("incoming.values.*"),
  enumOptional("incoming.unit", UNIT),

  arrayMaxLengthOpt({ min: 3, max: 3 }, "final.values"),
  decimalOptional("final.values.*"),
  enumOptional("final.unit", UNIT),
];

module.exports = {
  create,
};
