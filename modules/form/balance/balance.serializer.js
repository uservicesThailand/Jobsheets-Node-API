const balance = ({ inspection }) => {
  return {
    inspNo: inspection.inspNo || null,
    inspSv: inspection.inspServiceOrder || null,
  };
};

module.exports = {
  balance,
};
