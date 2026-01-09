const db = require("../../../../models");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormBalance,
        include: [
          {
            model: db.BalanceField,
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

  const balanceField = formBalance.BalanceField || null;

  return {
    success: true,
    inspection,
    formBalance,
    balanceField,
  };
};

const create = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.balanceField) {
      return {
        success: false,
        message: "Balance rotor already exists",
      };
    }

    const createdField = await db.BalanceField.create({
      ...body,
      balanceId: ctx.formBalance.balId,
    });

    return {
      success: true,
      data: {
        balanceField: createdField,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { create };
