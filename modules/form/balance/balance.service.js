const db = require("../../../models");
const create = async (inspNo, userKey) => {
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

    const existingFormBalance = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
    });

    if (existingFormBalance) {
      return {
        success: false,
        message: "Form balance already exists",
      };
    }

    const createdFormBalance = await db.FormBalance.create({
      inspId: inspectionId,
      createdBy: userKey,
      updatedBy: userKey,
    });

    return {
      success: true,
      data: {
        inspection: inspection,
        formBalance: createdFormBalance,
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
        },
      ],
    });

    if (!inspection) {
      return {
        success: false,
        message: "Form balance not found",
      };
    }

    return {
      success: true,
      data: {
        inspection: inspection,
        formBalance: inspection.FormBalance,
      },
    };
  } catch (error) {
    throw error;
  }
};

const remove = async (inspNo) => {
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

    const existingFormBalance = await db.FormBalance.findOne({
      where: { inspId: inspectionId },
    });

    if (!existingFormBalance) {
      return {
        success: false,
        message: "Form balance not found",
      };
    }

    await db.FormBalance.destroy({
      where: { inspId: inspectionId },
    });

    return {
      success: true,
      message: "Form balance deleted successfully",
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { create, get, remove };
