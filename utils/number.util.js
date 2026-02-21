const toNumberOrNull = (value) =>
  value === null || value === undefined ? null : Number(value);

module.exports = {
  toNumberOrNull,
};
