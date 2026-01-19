const { mapPayload } = require("./coil-test.serializer");
const db = require("../../../../models");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormCoilBrakeTest,
        include: [
          {
            model: db.CoilBrakeTest,
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

  const coilBrakeTest = formCoilBrakeTest.CoilBrakeTest || null;

  return {
    success: true,
    inspection,
    formCoilBrakeTest,
    coilBrakeTest,
  };
};

const save = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const payload = {
      ...mapPayload(body),
    };

    if (ctx.coilBrakeTest) {
      await ctx.coilBrakeTest.update(payload);

      return {
        success: true,
        created: false,
        data: { coilBrakeTest: ctx.coilBrakeTest },
      };
    }

    payload.coilBrakeTestId = ctx.formCoilBrakeTest.cbtId;
    const coilBrakeTest = await db.CoilBrakeTest.create(payload);
    await coilBrakeTest.reload();

    return {
      success: true,
      created: true,
      data: { coilBrakeTest },
    };
  } catch (error) {
    throw error;
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.coilBrakeTest) {
      return {
        success: false,
        message: "coil test not found",
      };
    }

    return {
      success: true,
      data: { coilBrakeTest: ctx.coilBrakeTest },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { save, get };
