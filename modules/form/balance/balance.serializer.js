const balance = ({ inspection, formBalance, createdBy, updatedBy }) => {
  return {
    inspNo: inspection.inspNo || null,
    inspSv: inspection.inspServiceOrder || null,
    updatedBy: `${updatedBy.name} ${updatedBy.lastname}`,
    createdBy: `${createdBy.name} ${createdBy.lastname}`,
    updateAt: formBalance.updatedAt,
    createdAt: formBalance.createdAt,
  };
};

module.exports = {
  balance,
};
