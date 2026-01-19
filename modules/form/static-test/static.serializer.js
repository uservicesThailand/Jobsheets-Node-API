const { toNumberOrNull } = require("../../../utils/number.util");

const mapResponse = ({ inspection, formStaticTest, createdBy, updatedBy }) => {
  return {
    inspNo: inspection.inspNo || null,
    inspSv: inspection.inspServiceOrder || null,
    voltKvdc1: toNumberOrNull(formStaticTest.voltKvdc1),
    voltKvdc2: toNumberOrNull(formStaticTest.voltKvdc2),
    note: formStaticTest.note,
    updatedBy: `${updatedBy.name} ${updatedBy.lastname}`,
    createdBy: `${createdBy.name} ${createdBy.lastname}`,
    updatedAt: formStaticTest.updatedAt,
    createdAt: formStaticTest.createdAt,
  };
};

module.exports = { mapResponse };
