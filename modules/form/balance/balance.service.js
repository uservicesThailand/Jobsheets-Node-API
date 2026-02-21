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
      await db.FormBalance.update(
        {
          updatedBy: userKey,
        },
        {
          where: { inspId: inspectionId },
        },
      );
      await existingFormBalance.reload({
        include: [
          { model: db.Uuser, as: "createdUser" },
          { model: db.Uuser, as: "updatedUser" },
        ],
      });
      return {
        success: true,
        created: false,
        data: {
          inspection: inspection,
          formBalance: existingFormBalance,
          createdBy: existingFormBalance.createdUser,
          updatedBy: existingFormBalance.updatedUser,
        },
      };
    }

    const formBalance = await db.FormBalance.create({
      inspId: inspectionId,
      createdBy: userKey,
      updatedBy: userKey,
    });

    const formWithUser = await db.FormBalance.findByPk(formBalance.balId, {
      include: [
        { model: db.Uuser, as: "createdUser" },
        { model: db.Uuser, as: "updatedUser" },
      ],
    });

    return {
      success: true,
      created: true,
      data: {
        inspection: inspection,
        formBalance: formWithUser,
        createdBy: formWithUser.createdUser,
        updatedBy: formWithUser.updatedUser,
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
            { model: db.Uuser, as: "createdUser" },
            { model: db.Uuser, as: "updatedUser" },
          ],
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
        createdBy: inspection.FormBalance.createdUser,
        updatedBy: inspection.FormBalance.updatedUser,
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
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { create, get, remove };
