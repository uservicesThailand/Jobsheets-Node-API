const mechanicalSchema = require("./mechanical.schemas");

/**
 * undefined → null
 */
const normalizeNull = (value) => {
  if (value === undefined) return null;
  if (value === null) return null;

  if (Array.isArray(value)) {
    return value.map(normalizeNull);
  }

  if (typeof value === "object") {
    const result = {};
    for (const key in value) {
      result[key] = normalizeNull(value[key]);
    }
    return result;
  }

  return value;
};

/**
 * build empty object from schema
 */
const buildEmptyFields = (fields) => {
  const obj = {};
  if (!fields) return obj;

  for (const key in fields) {
    const field = fields[key];

    if (field?.type === "object") {
      obj[key] = buildEmptyFields(field.fields);
    } else {
      obj[key] = null;
    }
  }

  return obj;
};

const buildEmptyFromSchema = () => {
  const result = {};
  for (const index in mechanicalSchema) {
    result[index] = buildEmptyFields(mechanicalSchema[index].fields);
  }
  return result;
};

/**
 * deep merge (payload override)
 */
const deepMerge = (base, incoming) => {
  if (!incoming) return base;

  const result = { ...base };

  for (const key in incoming) {
    if (
      incoming[key] &&
      typeof incoming[key] === "object" &&
      !Array.isArray(incoming[key])
    ) {
      result[key] = deepMerge(base[key] || {}, incoming[key]);
    } else {
      result[key] = incoming[key];
    }
  }

  return result;
};

/**
 * Serialize payload → DB data
 */
const prepareData = (payload = {}, existingData = null) => {
  const base = existingData || buildEmptyFromSchema();
  const merged = deepMerge(base, payload);

  return normalizeNull(merged);
};

const mapResponse = ({ formMechanicalService }) => {
  return {
    basket: formMechanicalService.basket,
    team: formMechanicalService.team,
    status: formMechanicalService.status,
    data: formMechanicalService.data,
  };
};

module.exports = {
  prepareData,
  mapResponse,
};
