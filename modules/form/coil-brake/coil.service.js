const { mapPayload } = require("./coil.serializer");
const db = require("../../../models");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormCoilBrakeTest,
        include: [
          {
            model: db.CoilBrakeTestType,
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

  const formCoilBrakeTest = inspection.FormCoilBrakeTest || null;

  return {
    success: true,
    inspection,
    formCoilBrakeTest,
  };
};

const update = async (formCoilBrakeTest, userKey, body) => {
  try {
    // update main form
    const updatedForm = await formCoilBrakeTest.update({
      ...mapPayload(body),
      updatedBy: userKey,
    });

    // sync brakeTypes if any
    const coilBrakeTestTypes = await syncBrakeTypes(
      formCoilBrakeTest.cbtId,
      body.brakeTypes
    );

    return {
      success: true,
      action: "updated",
      data: { formCoilBrakeTest: updatedForm, coilBrakeTestTypes },
    };
  } catch (error) {
    throw error;
  }
};

const save = async (inspNo, userKey, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    // update branch
    if (ctx.formCoilBrakeTest) {
      return await update(ctx.formCoilBrakeTest, userKey, body);
    }

    // create branch
    const payload = {
      inspId: ctx.inspection.inspId,
      ...mapPayload(body),
      createdBy: userKey,
      updatedBy: userKey,
    };

    const formCoilBrakeTest = await db.FormCoilBrakeTest.create(payload);

    const coilBrakeTestTypes = await syncBrakeTypes(
      formCoilBrakeTest.cbtId,
      body.brakeTypes
    );

    return {
      success: true,
      action: "created",
      data: { formCoilBrakeTest, coilBrakeTestTypes },
    };
  } catch (error) {
    throw error;
  }
};

const syncBrakeTypes = async (coilBrakeTestId, brakeTypes) => {
  try {
    if (!Array.isArray(brakeTypes) || brakeTypes.length === 0) return [];

    await db.CoilBrakeTestType.destroy({
      where: { coilBrakeTestId },
    });

    const dataMap = brakeTypes.map((item) => ({
      brakeTypeCode: item,
      coilBrakeTestId,
    }));

    return await db.CoilBrakeTestType.bulkCreate(dataMap);
  } catch (error) {
    throw error; // ให้ caller handle ต่อ
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.formCoilBrakeTest) {
      return {
        success: false,
        message: "form coil brake test not found",
      };
    }

    return {
      success: true,
      data: {
        formCoilBrakeTest: ctx.formCoilBrakeTest,
        coilBrakeTestTypes: ctx.formCoilBrakeTest.CoilBrakeTestTypes,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { save, get };
