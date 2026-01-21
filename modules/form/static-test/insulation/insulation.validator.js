const {
  decimalOptional,
  enumRequired,
  enumOptional,
  arrayMaxLength,
  stringOptional,
  uniqueInArray,
} = require("../../../../utils/validator.util");
const { body } = require("express-validator");

const { SECTION_TYPE, UNIT } = require("./insulation.constants");

const validateInsulation = body("data").custom((items) => {
  if (!Array.isArray(items)) return true;

  items.forEach((item, index) => {
    if (item.sectionType === "INCOMING") {
      if (item.polarizationIndexRec != null) {
        throw new Error(
          `data[${index}].polarizationIndexRec is not allowed for INCOMING`,
        );
      }
    }

    if (item.sectionType === "FINAL") {
      if (item.minInsulationRec != null) {
        throw new Error(
          `data[${index}].minInsulationRec is not allowed for FINAL`,
        );
      }
    }
  });

  return true;
});

const create = [
  arrayMaxLength(2),

  uniqueInArray("data", "sectionType"),
  enumRequired("data.*.sectionType", SECTION_TYPE),
  stringOptional("data.*.marking1"),
  stringOptional("data.*.marking2"),
  stringOptional("data.*.marking3"),

  decimalOptional("data.*.at1Value1"),
  decimalOptional("data.*.at1Value2"),
  decimalOptional("data.*.at1Value3"),
  enumOptional("data.*.at1Unit", UNIT),

  decimalOptional("data.*.at10Value1"),
  decimalOptional("data.*.at10Value2"),
  decimalOptional("data.*.at10Value3"),
  enumOptional("data.*.at10Unit", UNIT),

  stringOptional("data.*.minInsulationRec"),
  stringOptional("data.*.polarizationIndexRec"),

  validateInsulation,
];

module.exports = { create };
