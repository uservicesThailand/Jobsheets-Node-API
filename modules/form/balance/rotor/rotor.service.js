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

const createRotor = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.balanceRotor) {
      return {
        success: false,
        message: "Balance rotor already exists",
      };
    }

    const createdRotor = await db.BalanceRotor.create({
      ...body,
      balanceId: ctx.formBalance.balId,
    });

    return {
      success: true,
      data: {
        balanceRotor: createdRotor,
      },
    };
  } catch (error) {
    throw error;
  }
};

const createRotorBalance = async (inspNo, body) => {
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
      return {
        success: false,
        message: "Rotor balance already exists",
      };
    }

    const rotorBalance = await db.BalanceRotorBalance.create({
      ...body,
      balanceRotorId: ctx.balanceRotor.rotorId,
    });

    return {
      success: true,
      data: {
        rotorBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

const createRotorRunout = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    const existing = await db.BalanceRotorRunout.findOne({
      where: { balanceRotorId: ctx.balanceRotor.rotorId },
    });

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
      data: {
        rotorRunout,
      },
    };
  } catch (error) {
    throw error;
  }
};

const createRotorRunoutResult = async (inspNo, body) => {
  try {
    const ctx = await resolveBalanceContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    const existing = await db.BalanceRotorRunoutResult.findOne({
      where: { balanceRotorId: ctx.balanceRotor.rotorId },
    });

    if (existing) {
      return {
        success: false,
        message: "Rotor runout result already exists",
      };
    }

    const allCombos = resultGenerate(ctx.balanceRotor.rotorId);
    const mergedRows = mergeResultPayload(allCombos, body);

    const rotorRunoutResult = await db.BalanceRotorRunoutResult.bulkCreate(
      mergedRows
    );

    return {
      success: true,
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
  createRotor,
  createRotorBalance,
  createRotorRunout,
  createRotorRunoutResult,
  getRotor,
  getRotorBalance,
  getRotorRunout,
  getRotorRunoutResult,
};
