const db = require("../../../../models");

const create = async (inspNo, body) => {
  let balanceId;
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
    });

    if (!inspection) {
      return {
        success: false,
        message: "Inspection not found",
      };
    }

    const inspectionId = inspection.inspId;

    const formBalance = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
    });

    if (!formBalance) {
      return {
        success: false,
        message: "form balance not found",
      };
    }

    balanceId = formBalance.balId;

    const balanceShaft = await db.BalanceShaft.create({
      ...body,
      balanceId: balanceId,
    });

    return {
      success: true,
      data: {
        inspection: inspection,
        formBalance: formBalance,
        balanceShaft: balanceShaft,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
};
