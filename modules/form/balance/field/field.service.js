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

const save = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.balanceField) {
      await ctx.balanceField.update(body);
      return {
        success: true,
        action: "updated",
        data: {
          balanceField: ctx.balanceField,
        },
      };
    }

    const createdField = await db.BalanceField.create({
      ...body,
      balanceId: ctx.formBalance.balId,
    });

    return {
      success: true,
      action: "created",
      data: {
        balanceField: createdField,
      },
    };
  } catch (error) {
    throw error;
  }
};

const savePosition = async (inspNo, body) => {
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

    const count = await db.BalanceFieldPosition.count({
      where: { balanceFieldId },
    });

    if (count > 0) {
      return await updatePosition(body, balanceFieldId);
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

const updatePosition = async (bodys, balanceFieldId) => {
  try {
    for (const body of bodys) {
      await db.BalanceFieldPosition.update(body, {
        where: {
          balanceFieldId: balanceFieldId,
          positionIndex: body.positionIndex,
        },
      });
    }

    const fieldPositions = await db.BalanceFieldPosition.findAll({
      where: { balanceFieldId },
    });

    return {
      success: true,
      action: "updated",
      data: {
        fieldPositions,
      },
    };
  } catch (error) {
    throw error;
  }
};

const saveLocation = async (inspNo, body) => {
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

    const count = await db.BalanceFieldLocation.count({
      where: { balanceFieldId },
    });

    if (count > 0) {
      return await updateLocation(body, balanceFieldId);
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

const updateLocation = async (bodys, balanceFieldId) => {
  try {
    for (const body of bodys) {
      await db.BalanceFieldLocation.update(body, {
        where: {
          balanceFieldId: balanceFieldId,
          location: body.location,
        },
      });
    }

    const fieldLocations = await db.BalanceFieldLocation.findAll({
      where: { balanceFieldId },
    });

    return {
      success: true,
      action: "updated",
      data: {
        fieldLocations,
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
              model: db.BalanceField,
              required: true,
            },
          ],
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Balance field not found",
      };
    }

    return {
      success: true,
      data: {
        balanceField: inspection.FormBalance.BalanceField,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getPosition = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceField,
              required: true,
              include: [
                {
                  model: db.BalanceFieldPosition,
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
        message: "field position not found",
      };
    }

    return {
      success: true,
      data: {
        fieldPositions:
          inspection.FormBalance.BalanceField.BalanceFieldPositions,
      },
    };
  } catch (error) {
    throw error;
  }
};

const getLocation = async (inspNo) => {
  try {
    const inspection = await db.TblInspectionList.findOne({
      where: { inspNo },
      include: [
        {
          model: db.FormBalance,
          required: true,
          include: [
            {
              model: db.BalanceField,
              required: true,
              include: [
                {
                  model: db.BalanceFieldLocation,
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
        message: "field location not found",
      };
    }

    return {
      success: true,
      data: {
        fieldLocations:
          inspection.FormBalance.BalanceField.BalanceFieldLocations,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  save,
  savePosition,
  saveLocation,
  get,
  getPosition,
  getLocation,
};
