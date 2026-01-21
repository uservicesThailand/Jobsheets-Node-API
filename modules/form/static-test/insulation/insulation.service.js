const db = require("../../../../models");
const { generate, merge } = require("./insulation.serializer");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormStaticTest,
        include: [
          {
            model: db.StaticTestInsulation,
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

  const formStaticTest = inspection.FormStaticTest;

  if (!formStaticTest) {
    return {
      success: false,
      message: "form static test not found",
    };
  }

  const staticTestInsulations =
    formStaticTest.StaticTestInsulations.length > 0
      ? formStaticTest.StaticTestInsulations
      : null;

  return {
    success: true,
    inspection,
    formStaticTest,
    staticTestInsulations,
  };
};

const upsert = async (inspNo, userKey, dataUpsert) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const staticTestId = ctx.formStaticTest.sttId;

    if (ctx.staticTestInsulations) {
      return await update(dataUpsert, staticTestId, userKey);
    }

    const generatedRows = generate(staticTestId, userKey);
    const finalRows = merge(generatedRows, dataUpsert);

    await db.StaticTestInsulation.bulkCreate(finalRows);

    const staticTestInsulations = await db.StaticTestInsulation.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: true,
      data: {
        staticTestInsulations,
      },
    };
  } catch (err) {
    throw err;
  }
};

const update = async (dataUpdate, staticTestId, userKey) => {
  try {
    for (const data of dataUpdate) {
      await db.StaticTestInsulation.update(
        { ...data, updatedBy: userKey },
        {
          where: {
            staticTestId: staticTestId,
            sectionType: data.sectionType,
          },
        },
      );
    }

    const staticTestInsulations = await db.StaticTestInsulation.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: false,
      data: {
        staticTestInsulations,
      },
    };
  } catch (error) {
    throw error;
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.staticTestInsulations) {
      return {
        success: false,
        message: "static test insulation not found.",
      };
    }

    return {
      success: true,
      data: {
        staticTestInsulations: ctx.staticTestInsulations,
      },
    };
  } catch (err) {
    throw err;
  }
};

const remove = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.staticTestInsulations) {
      return {
        success: false,
        message: "static test insulation not found.",
      };
    }
    await db.StaticTestInsulation.destroy({
      where: {
        staticTestId: ctx.formStaticTest.sttId,
      },
    });
    return {
      success: true,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  upsert,
  get,
  remove,
};
