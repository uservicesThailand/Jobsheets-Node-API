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

const save = async (inspNo, body) => {
  try {
    const ctx = await resolveShaftContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.balanceShaft) {
      await ctx.balanceShaft.update(body);
      return {
        success: true,
        created: false,
        data: {
          balanceShaft: ctx.balanceShaft,
        },
      };
    }

    const balanceShaft = await db.BalanceShaft.create({
      ...body,
      balanceId: ctx.formBalance.balId,
    });
    await balanceShaft.reload();

    return {
      success: true,
      created: true,
      data: {
        balanceShaft,
      },
    };
  } catch (error) {
    throw error;
  }
};

const saveBalance = async (inspNo, body) => {
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
      await existing.update(body);
      return {
        success: true,
        created: false,
        data: {
          shaftBalance: existing,
        },
      };
    }

    const shaftBalance = await db.BalanceShaftBalance.create({
      ...body,
      balanceShaftId: ctx.balanceShaft.shaftId,
    });
    await shaftBalance.reload();

    return {
      success: true,
      created: true,
      data: {
        shaftBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

const get = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceShaft,
              required: true,
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Balance shaft not found",
      };
    }

    return {
      success: true,
      data: {
        balanceShaft: inspection.FormBalance.BalanceShaft,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getBalance = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceShaft,
              required: true,
              include: [
                {
                  model: db.BalanceShaftBalance,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Balance shaft not found",
      };
    }

    return {
      success: true,
      data: {
        shaftBalance: inspection.FormBalance.BalanceShaft.BalanceShaftBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  save,
  saveBalance,
  get,
  getBalance,
};
