const schemas = require("./mechanical.schemas");

const validateValue = (rule, value, path, errors) => {
  if (value === undefined) return;

  switch (rule.type) {
    case "enum":
      if (!rule.values.includes(value))
        errors.push(`${path} must be one of ${rule.values.join(", ")}`);
      break;

    case "string":
      if (typeof value !== "string") errors.push(`${path} must be string`);
      break;

    case "number":
      if (typeof value !== "number") errors.push(`${path} must be number`);
      break;

    case "decimal":
      if (typeof value !== "number") errors.push(`${path} must be decimal`);
      break;

    case "object":
      for (const [k, r] of Object.entries(rule.fields)) {
        validateValue(
          typeof r === "string" ? { type: r } : r,
          value?.[k],
          `${path}.${k}`,
          errors
        );
      }
      break;
  }
};

const validatePayload = (payload) => {
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

module.exports = { validatePayload };
