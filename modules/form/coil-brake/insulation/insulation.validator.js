const {
  decimalOptional,
  enumOptional,
} = require("../../../../utils/validator.util");

const { UNIT } = require("./insulation.constants");

const create = [
  decimalOptional("volt"),
  decimalOptional("incoming.value"),
  enumOptional("incoming.unit", UNIT),
  decimalOptional("final.value"),
  enumOptional("final.unit", UNIT),
];

module.exports = {
  create,
};
