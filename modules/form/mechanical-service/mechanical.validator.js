const { TEAM, STATUS } = require("./mechanical.constants");
const schemas = require("./mechanical.schemas");
const {
  stringOptional,
  enumOptional,
} = require("../../../utils/validator.util");

const validateValue = (rule, value, path, errors) => {
  if (value === undefined) return;

  if (value === null) return;
  switch (rule.type) {
    case "enum":
      if (!rule.values.includes(value))
        errors.push(
          `${path} : Value must be one of: ${rule.values.join(", ")}`
        );
      break;

    case "string":
      if (typeof value !== "string") errors.push(`${path}: must be string`);
      break;

    case "integer":
      if (value === undefined || value === null) return;

      if (
        typeof value !== "number" ||
        Number.isNaN(value) ||
        !Number.isInteger(value)
      ) {
        errors.push(`${path}: must be integer`);
      }
      break;

    case "decimal":
      if (typeof value !== "number" || Number.isNaN(value)) {
        errors.push(`${path}: must be a decimal number`);
        return;
      }

      if (rule.precision !== undefined) {
        const decimalPlaces = value.toString().split(".")[1]?.length || 0;
        if (decimalPlaces > rule.precision) {
          errors.push(
            `${path}: Invalid decimal (max ${rule.precision} digits)`
          );
        }
      }
      break;

    case "object":
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`${path}: must be an object`);
        return;
      }

      for (const [k, r] of Object.entries(rule.fields)) {
        validateValue(
          typeof r === "string" ? { type: r } : r,
          value[k],
          `${path}.${k}`,
          errors
        );
      }
      break;
  }
};

const validatePayload = (payload = {}) => {
  const errors = [];
  for (const [itemNo, data] of Object.entries(payload)) {
    const schema = schemas[itemNo];
    if (!schema) {
      errors.push(`Unknown item ${itemNo}`);
      continue;
    }

    for (const [field, rule] of Object.entries(schema.fields)) {
      validateValue(rule, data[field], `${itemNo}.${field}`, errors);
    }
  }

  return errors;
};

const create = [
  stringOptional("basket"),
  enumOptional("team", TEAM),
  enumOptional("status", STATUS),
];

module.exports = { validatePayload, create };
