const { mapPayload } = require("./insulation.serializer");
const db = require("../../../../models");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormCoilBrakeTest,
        include: [
          {
            model: db.InsulationTest,
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

  const formCoilBrakeTest = inspection.FormCoilBrakeTest;
  if (!formCoilBrakeTest) {
    return {
      success: false,
      message: "Form coil brake test not found",
    };
  }

  const insulationTest = formCoilBrakeTest.InsulationTest || null;

  return {
    success: true,
    inspection,
    formCoilBrakeTest,
    insulationTest,
  };
};

const save = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const payload = {
      ...mapPayload(body),
    };

    if (ctx.insulationTest) {
      await ctx.insulationTest.update(payload);
      return {
        success: true,
        created: false,
        data: { insulationTest: ctx.insulationTest },
      };
    }

    payload.coilBrakeTestId = ctx.formCoilBrakeTest.cbtId;
    const insulationTest = await db.InsulationTest.create(payload);
    await insulationTest.reload();

    return {
      success: true,
      created: true,
      data: { insulationTest },
    };
  } catch (error) {
    throw error;
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.insulationTest) {
      return {
        success: false,
        message: "insulation not found",
      };
    }

    return {
      success: true,
      data: { insulationTest: ctx.insulationTest },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { save, get };
