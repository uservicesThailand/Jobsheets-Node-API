const db = require("../../models");

const createRotor = async (inspNo, userKey, body) => {
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

    const existingBalanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
    });

    if (existingBalanceRotor) {
      return {
        success: false,
        message: "Balance rotor already exists",
      };
    }

    const createdBalanceRotor = await db.FormBalance.create({
      inspId: inspectionId,
      createdBy: userKey,
      updatedBy: userKey,
    });

    const createdRotor = await db.BalanceRotor.create({
      rotorType: body.rotorType,
      includeWith: body.includeWith,
      rotorWeight: body.rotorWeight,
      diameterA: body.diameterA,
      diameterB: body.diameterB,
      diameterC: body.diameterC,
      radius1: body.radius1,
      radius2: body.radius2,
      rotorSpeed: body.rotorSpeed,
      note: body.note,
      balanceId: createdBalanceRotor.balId,
    });

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: createdBalanceRotor.toJSON(),
        balanceRotor: createdRotor.toJSON(),
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { createRotor };
