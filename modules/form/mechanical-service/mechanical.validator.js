const { TEAM, STATUS } = require("./mechanical.constants");

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
      let str;

      if (typeof value === "number") {
        if (!Number.isFinite(value)) {
          errors.push(`${path}: must be a finite decimal number`);
          return;
        }
        str = value.toString();
      } else if (typeof value === "string") {
        str = value;
      } else {
        errors.push(`${path}: must be a decimal (string or number)`);
        return;
      }

      if (!/^-?\d+(\.\d+)?$/.test(str)) {
        errors.push(`${path}: invalid decimal format`);
        return;
      }

      if (rule.precision !== undefined) {
        const decimalPlaces = str.toString().split(".")[1]?.length || 0;
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

const validatePayload = (payload = {}, schemas) => {
  const errors = [];
  for (const [itemNo, data] of Object.entries(payload)) {
    const schema = schemas[itemNo];
    if (!schema) {
      errors.push(`Unknown item ${itemNo}`);
      continue;
    }

    for (const field of Object.keys(data || {})) {
      if (!schema.fields[field]) {
        errors.push(`Unknown field ${itemNo}.${field}`);
      }
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
