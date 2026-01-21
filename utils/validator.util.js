const { body } = require("express-validator");

const decimalOptional = (field, { max = 3 } = {}) =>
  body(field)
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: `0,${max}` })
    .withMessage(`Invalid decimal (max ${max} digits)`)
    .customSanitizer((value) => {
      if (value === null || value === undefined || value === "") return null;
      let [intPart, decPart = ""] = String(value).toString().split(".");
      // เติม 0 ให้ครบ ตำแหน่ง
      decPart = decPart.padEnd(max, "0");
      return `${intPart}.${decPart}`;
    });

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

const uniqueInArray = (arrayField = "data", key) =>
  body(arrayField).custom((arr) => {
    if (!Array.isArray(arr)) return true;

    const seen = new Map();

    for (let i = 0; i < arr.length; i += 1) {
      const value = arr[i]?.[key];

      if (value === undefined || value === null) continue;

      if (seen.has(value)) {
        const firstIndex = seen.get(value);

        throw new Error(
          `${arrayField}[${i}].${key} duplicated with ${arrayField}[${firstIndex}].${key}`,
        );
      }

      seen.set(value, i);
    }

    return true;
  });

module.exports = {
  decimalOptional,
  enumOptional,
  enumRequired,
  stringOptional,
  arrayMaxLength,
  arrayMaxLengthOpt,
  uniqueInArray,
};
