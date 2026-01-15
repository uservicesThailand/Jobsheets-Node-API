module.exports = {
  enum: (values) => ({ type: "enum", values }),
  string: () => ({ type: "string" }),
  integer: () => ({ type: "integer" }),
  decimal: (precision = 3) => ({ type: "decimal", precision }),
  object: (fields) => ({ type: "object", fields }),
};
