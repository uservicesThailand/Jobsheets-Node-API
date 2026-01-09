const field = ({ balanceField }) => {
  return {
    checkResult: balanceField.checkResult || null,
    note: balanceField.note || null,
  };
};

module.exports = {
  field,
};
