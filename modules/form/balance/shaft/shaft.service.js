const db = require("../../../../models");

const resolveShaftContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormBalance,
        include: [
          {
            model: db.BalanceShaft,
          },
        ],
      },
    ],
  });

  if (!inspection) {
    return {
      success: false,
      message: "Inspection not found",
    };
  }

  const formBalance = inspection.FormBalance;
  if (!formBalance) {
    return {
      success: false,
      message: "Form balance not found",
    };
  }

  const balanceShaft = formBalance.BalanceShaft || null;

  return {
    success: true,
    inspection,
    formBalance,
    balanceShaft,
  };
};

const create = async (inspNo, body) => {
  try {
    const ctx = await resolveShaftContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.balanceShaft) {
      return {
        success: false,
        message: "Balance shaft already exists",
      };
    }

    const balanceShaft = await db.BalanceShaft.create({
      ...body,
      balanceId: ctx.formBalance.balId,
    });

    return {
      success: true,
      data: {
        balanceShaft,
      },
    };
  } catch (error) {
    throw error;
  }
};

const createBalance = async (inspNo, body) => {
  try {
    const ctx = await resolveShaftContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceShaft) {
      return {
        success: false,
        message: "Balance shaft not found",
      };
    }

    const existing = await db.BalanceShaftBalance.findOne({
      where: { balanceShaftId: ctx.balanceShaft.shaftId },
    });

    if (existing) {
      return {
        success: false,
        message: "Shaft balance already exists",
      };
    }

    const shaftBalance = await db.BalanceShaftBalance.create({
      ...body,
      balanceShaftId: ctx.balanceShaft.shaftId,
    });

    return {
      success: true,
      data: {
        shaftBalance,
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
