const db = require("../../../models");

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
      ...body,
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

const createRotorBalance = async (inspNo, userKey, body) => {
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

    const balanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
      include: [{ model: db.BalanceRotor, required: true }],
    });

    if (!balanceRotor) {
      return {
        success: false,
        message: "Balance rotor not found",
      };
    }

    const rotorBalance = await db.BalanceRotorBalance.create({
      ...body,
      balanceRotorId: balanceRotor.BalanceRotor.rotorId,
    });

    return {
      success: true,
      data: {
        inspection: inspection.toJSON(),
        formBalance: balanceRotor.toJSON(),
        rotorBalance: rotorBalance.toJSON(),
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { createRotor, createRotorBalance };
