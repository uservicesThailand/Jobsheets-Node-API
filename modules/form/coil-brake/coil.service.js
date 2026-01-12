const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormBalance,
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

const create = async (inspNo, userKey) => {
  try {
    console.log(inspNo, userKey);

    return {
      success: true,
      data: {},
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { create };
