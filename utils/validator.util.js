const { body } = require("express-validator");

const decimalOptional = (field) =>
  body(field)
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Invalid decimal (max 2 digits)");

module.exports = { decimalOptional };
