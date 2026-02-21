const removeUndefined = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  );

module.exports = { removeUndefined };
