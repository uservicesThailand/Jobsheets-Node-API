const db = require("../../../../models");
const {
  generateAllCombos,
  mergeRunoutData,
  mergeResultPayload,
  resultGenerate,
} = require("./rotor.generator");

const resolveBalanceContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormBalance,
        include: [
          {
            model: db.BalanceRotor,
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

  const balanceRotor = formBalance.BalanceRotor || null;

  return {
    success: true,
    inspection,
    formBalance,
    balanceRotor,
  };
};

const saveRotor = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.balanceRotor) {
      await ctx.balanceRotor.update(body);

      return {
        success: true,
        created: false,
        data: {
          balanceRotor: ctx.balanceRotor,
        },
      };
    }

    const createdRotor = await db.BalanceRotor.create({
      ...body,
      balanceId: ctx.formBalance.balId,
    });
    await createdRotor.reload();

    return {
      success: true,
      created: true,
      data: {
        balanceRotor: createdRotor,
      },
    };
  } catch (error) {
    throw error;
  }
};

const saveRotorBalance = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    const existing = await db.BalanceRotorBalance.findOne({
      where: { balanceRotorId: ctx.balanceRotor.rotorId },
    });

    if (existing) {
      await existing.update(body);
      return {
        success: true,
        created: false,
        data: {
          rotorBalance: existing,
        },
      };
    }

    const rotorBalance = await db.BalanceRotorBalance.create({
      ...body,
      balanceRotorId: ctx.balanceRotor.rotorId,
    });
    await rotorBalance.reload();

    return {
      success: true,
      created: true,
      data: {
        rotorBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

const saveRotorRunout = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    const count = await db.BalanceRotorRunout.count({
      where: { balanceRotorId: ctx.balanceRotor.rotorId },
    });

    if (count > 0) {
      return await updateRotorRunout(body, ctx.balanceRotor.rotorId);
    }

    if (existing) {
      return {
        success: false,
        message: "Rotor runout already exists",
      };
    }

    const allCombos = generateAllCombos(ctx.balanceRotor.rotorId);
    const mergedRows = mergeRunoutData(allCombos, body);

    const rotorRunout = await db.BalanceRotorRunout.bulkCreate(mergedRows);

    return {
      success: true,
      created: true,
      data: {
        rotorRunout,
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateRotorRunout = async (bodys, balanceRotorId) => {
  try {
    for (const body of bodys) {
      await db.BalanceRotorRunout.update(
        { value: body.value },
        {
          where: {
            balanceRotorId: balanceRotorId,
            phase: body.phase,
            side: body.side,
            point: body.point,
            position: body.position,
          },
        }
      );
    }

    const rotorRunout = await db.BalanceRotorRunout.findAll({
      where: { balanceRotorId },
    });

    return {
      success: true,
      created: false,
      data: {
        rotorRunout,
      },
    };
  } catch (error) {
    throw error;
  }
};

const saveRotorRunoutResult = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    const count = await db.BalanceRotorRunoutResult.count({
      where: { balanceRotorId: ctx.balanceRotor.rotorId },
    });

    if (count > 0) {
      return await updateRotorRunoutResult(body, ctx.balanceRotor.rotorId);
    }

    const allCombos = resultGenerate(ctx.balanceRotor.rotorId);
    const mergedRows = mergeResultPayload(allCombos, body);

    const rotorRunoutResult = await db.BalanceRotorRunoutResult.bulkCreate(
      mergedRows
    );

    return {
      success: true,
      created: true,
      data: {
        rotorRunoutResult,
      },
    };
  } catch (error) {
    throw error;
  }
};

const updateRotorRunoutResult = async (bodys, balanceRotorId) => {
  try {
    for (const body of bodys) {
      await db.BalanceRotorRunoutResult.update(
        { result: body.result },
        {
          where: {
            balanceRotorId: balanceRotorId,
            phase: body.phase,
          },
        }
      );
    }

    const rotorRunoutResult = await db.BalanceRotorRunoutResult.findAll({
      where: { balanceRotorId },
    });

    return {
      success: true,
      created: false,
      data: {
        rotorRunoutResult,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getRotor = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceRotor,
              required: true,
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    return {
      success: true,
      data: {
        balanceRotor: inspection.FormBalance.BalanceRotor,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getRotorBalance = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceRotor,
              required: true,
              include: [
                {
                  model: db.BalanceRotorBalance,
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
        message: "Balance rotor not found",
      };
    }

    return {
      success: true,
      data: {
        rotorBalance: inspection.FormBalance.BalanceRotor.BalanceRotorBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getRotorRunout = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceRotor,
              required: true,
              include: [
                {
                  model: db.BalanceRotorRunout,
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
        message: "Balance rotor not found",
      };
    }

    return {
      success: true,
      data: {
        rotorRunout: inspection.FormBalance.BalanceRotor.BalanceRotorRunouts,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getRotorRunoutResult = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceRotor,
              required: true,
              include: [
                {
                  model: db.BalanceRotorRunoutResult,
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
        message: "Balance rotor not found",
      };
    }

    return {
      success: true,
      data: {
        rotorRunoutResult:
          inspection.FormBalance.BalanceRotor.BalanceRotorRunoutResults,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveRotor,
  saveRotorBalance,
  saveRotorRunout,
  saveRotorRunoutResult,
  getRotor,
  getRotorBalance,
  getRotorRunout,
  getRotorRunoutResult,
};
