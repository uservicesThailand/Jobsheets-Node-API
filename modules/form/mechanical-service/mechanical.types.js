module.exports = {
  enum: (values) => ({ type: "enum", values }),
  string: () => ({ type: "string" }),
  number: () => ({ type: "number" }),
  decimal: (precision = 3) => ({ type: "decimal", precision }),
  object: (fields) => ({ type: "object", fields }),
};
