const {
  stringOptional,
  enumOptional,
} = require("../../../../utils/validator.util");
const { CHECK_RESULT } = require("./field.constants");

const createField = [
  enumOptional("checkResult", CHECK_RESULT),
  stringOptional("note", { max: 500 }),
];

module.exports = { createField };
