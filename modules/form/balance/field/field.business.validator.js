const validateBusiness = (rows, key) => {
  const errors = [];

  if (!Array.isArray(rows) || rows.length <= 1) {
    return errors;
  }

  const seen = new Set();

  rows.forEach((row, index) => {
    if (seen.has(row[key])) {
      errors.push(`data[${index}].${key}: value must be unique`);
    } else {
      seen.add(row[key]);
    }
  });

  return errors;
};

module.exports = {
  validateBusiness,
};
