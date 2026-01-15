const { body } = require("express-validator");

const decimalOptional = (field) =>
  body(field)
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,3" })
    .withMessage("Invalid decimal (max 3 digits)");

const enumOptional = (field, allowedValues) =>
  body(field)
    .optional({ nullable: true })
    .isIn(allowedValues)
    .withMessage(`Value must be one of: ${allowedValues.join(", ")}`);

const enumRequired = (field, allowedValues) => {
  return body(field)
    .exists({ checkNull: true })
    .withMessage("is required")
    .bail()
    .isIn(allowedValues)
    .withMessage(`Value must be one of: ${allowedValues.join(", ")}`);
};

const stringOptional = (field, { min = 1, max = 255 } = {}) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage("Invalid string")
    .trim()
    .isLength({ min, max })
    .withMessage(`String length must be between ${min} and ${max}`);

const arrayMaxLength = (max, key = "data") =>
  body(key).isArray({ max }).withMessage(`Array length must not exceed ${max}`);

const arrayMaxLengthOpt = ({ min, max }, key = "data") =>
  body(key)
    .optional()
    .isArray({ min, max })
    .withMessage(`Array length must not exceed (${(min, max)})`);

module.exports = {
  decimalOptional,
  enumOptional,
  enumRequired,
  stringOptional,
  arrayMaxLength,
  arrayMaxLengthOpt,
};
