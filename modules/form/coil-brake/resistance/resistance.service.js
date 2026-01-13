const { mapPayload } = require("./resistance.serializer");
const db = require("../../../../models");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormCoilBrakeTest,
        include: [
          {
            model: db.ResistanceTest,
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

  const resistanceTest = formCoilBrakeTest.ResistanceTest || null;

  return {
    success: true,
    inspection,
    formCoilBrakeTest,
    resistanceTest,
  };
};

const save = async (inspNo, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const payload = {
      ...mapPayload(body),
    };

    console.log(payload);

    if (ctx.resistanceTest) {
      await ctx.resistanceTest.update(payload);

      console.log(ctx.resistanceTest.toJSON());
      return {
        success: true,
        created: false,
        data: { resistanceTest: ctx.resistanceTest },
      };
    }

    payload.coilBrakeTestId = ctx.formCoilBrakeTest.cbtId;
    const resistanceTest = await db.ResistanceTest.create(payload);

    return {
      success: true,
      created: true,
      data: { resistanceTest },
    };
  } catch (error) {
    throw error;
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.resistanceTest) {
      return {
        success: false,
        message: "insulation not found",
      };
    }

    return {
      success: true,
      data: { resistanceTest: ctx.resistanceTest },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { save, get };
