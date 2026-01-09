const validatePosition = (rows) => {
  const errors = [];

  if (!Array.isArray(rows) || rows.length <= 1) {
    return errors;
  }

  const seen = new Set();

  rows.forEach((row, index) => {
    if (seen.has(row.positionIndex)) {
      errors.push(`data[${index}].positionIndex: value must be unique`);
    } else {
      seen.add(row.positionIndex);
    }
  });

  return errors;
};

module.exports = {
  validatePosition,
};
