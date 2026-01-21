const {
  decimalOptional,
  enumRequired,
  enumOptional,
  arrayMaxLength,
  stringOptional,
  uniqueInArray,
} = require("../../../../utils/validator.util");

const { SECTION_TYPE, UNIT } = require("./inductance.constants");

const create = [
  arrayMaxLength(2),

  uniqueInArray("data", "sectionType"),
  enumRequired("data.*.sectionType", SECTION_TYPE),
  stringOptional("data.*.marking1"),
  stringOptional("data.*.marking2"),
  stringOptional("data.*.marking3"),
  decimalOptional("data.*.value1"),
  decimalOptional("data.*.value2"),
  decimalOptional("data.*.value3"),

  enumOptional("data.*.unit", UNIT),
];

module.exports = { create };
