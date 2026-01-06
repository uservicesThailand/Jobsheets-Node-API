const db = require("../../models");

const createRoter = async (inspNo) => {
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

    const balanceRotor = await db.FormBalance.findOne({
      where: { inspId: inspection.inspId },
    });

    if (balanceRotor) {
      return {
        success: false,
        message: "balance rotor duplicate",
      };
    }

    return {
      success: true,
      message: "passs",
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { createRoter };
