const mapResponse = ({ inspection, formStaticTest, createdBy, updatedBy }) => {
  return {
    inspNo: inspection.inspNo || null,
    inspSv: inspection.inspServiceOrder || null,
    voltKvdc1: formStaticTest.voltKvdc1,
    voltKvdc2: formStaticTest.voltKvdc2,
    note: formStaticTest.note,
    updatedBy: `${updatedBy.name} ${updatedBy.lastname}`,
    createdBy: `${createdBy.name} ${createdBy.lastname}`,
    updatedAt: formStaticTest.updatedAt,
    createdAt: formStaticTest.createdAt,
  };
};

module.exports = { mapResponse };
