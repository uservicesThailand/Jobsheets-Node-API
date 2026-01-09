const db = require("../../../../models");

const create = async (inspNo, body) => {
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

    const balanceShaft = await db.BalanceShaft.create({
      ...body,
      balanceId: formBalance.balId,
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

const createBalance = async (inspNo, body) => {
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

    const balanceShaft = await db.BalanceShaft.findOne({
      where: { balanceId: formBalance.balId },
    });

    if (!balanceShaft) {
      return {
        success: false,
        message: "balance shaft not found",
      };
    }

    const shaftBalance = await db.BalanceShaftBalance.create({
      ...body,
      balanceShaftId: balanceShaft.shaftId,
    });

    return {
      success: true,
      data: {
        inspection: inspection,
        formBalance: formBalance,
        shaftBalance: shaftBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  create,
  createBalance,
};
