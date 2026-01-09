const {
  stringOptional,
  enumOptional,
  decimalOptional,
  enumRequired,
  arrayMaxLength
} = require("../../../../utils/validator.util");
const { body } = require("express-validator");
const { CHECK_RESULT, POSITION_INDEX } = require("./field.constants");

const createField = [
  enumOptional("checkResult", CHECK_RESULT),
  stringOptional("note", { max: 500 }),
];

const createPosition = [
  arrayMaxLength(2),

  enumRequired("data.*.positionIndex", POSITION_INDEX),
  stringOptional("data.*.positionName", { max: 50 }),
  decimalOptional("data.*.beforeUnbalance"),
  decimalOptional("data.*.beforeDegree1"),
  decimalOptional("data.*.beforeWeight"),
  decimalOptional("data.*.beforeDegree2"),
  decimalOptional("data.*.afterUnbalance"),
  decimalOptional("data.*.afterDegree1"),
  decimalOptional("data.*.afterWeight"),
  decimalOptional("data.*.afterDegree1"),
];

module.exports = { createField, createPosition };
