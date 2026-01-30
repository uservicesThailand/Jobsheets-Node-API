const {
  decimalOptional,
  enumRequired,
  enumOptional,
  arrayMaxLength,
  uniqueInArray,
} = require("../../../../utils/validator.util");

const { SECTION_TYPE, UNIT } = require("./inductance.constants");

const create = [
  arrayMaxLength(2),

  uniqueInArray("data", "sectionType"),
  enumRequired("data.*.sectionType", SECTION_TYPE),
  decimalOptional("data.*.value1"),
  decimalOptional("data.*.value2"),
  decimalOptional("data.*.value3"),

  enumOptional("data.*.unit", UNIT),
];

module.exports = { create };
