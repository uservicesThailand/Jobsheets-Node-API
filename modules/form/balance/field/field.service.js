const db = require("../../../../models");
const {
  generateAllCombos,
  mergeByKey,
  generateAllLocation,
} = require("./field.generator");

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

const createPosition = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceField) {
      return {
        success: false,
        message: "Balance field not found",
      };
    }

    const balanceFieldId = ctx.balanceField.id;

    const existing = await db.BalanceFieldPosition.findOne({
      where: { balanceFieldId },
    });

    if (existing) {
      return {
        success: false,
        message: "field position already exists",
      };
    }

    const generatedRows = generateAllCombos(balanceFieldId);
    const finalRows = mergeByKey(generatedRows, body, "positionIndex");

    const fieldPositions = await db.BalanceFieldPosition.bulkCreate(finalRows);

    return {
      success: true,
      data: {
        fieldPositions,
      },
    };
  } catch (error) {
    throw error;
  }
};

const createLocation = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.balanceField) {
      return {
        success: false,
        message: "Balance field not found",
      };
    }

    const balanceFieldId = ctx.balanceField.id;

    const existing = await db.BalanceFieldLocation.findOne({
      where: { balanceFieldId },
    });

    if (existing) {
      return {
        success: false,
        message: "field position already exists",
      };
    }

    const generatedRows = generateAllLocation(balanceFieldId);
    const finalRows = mergeByKey(generatedRows, body, "location");

    const fieldLocations = await db.BalanceFieldLocation.bulkCreate(finalRows);

    return {
      success: true,
      data: {
        fieldLocations,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { create, createPosition, createLocation };
