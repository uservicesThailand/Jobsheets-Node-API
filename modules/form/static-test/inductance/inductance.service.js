const db = require("../../../../models");
const { generate, merge } = require("./inductance.serializer");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormStaticTest,
        include: [
          {
            model: db.StaticTestInductance,
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

  const staticTestInductances =
    formStaticTest.StaticTestInductances.length > 0
      ? formStaticTest.StaticTestInductances
      : null;

  return {
    success: true,
    inspection,
    formStaticTest,
    staticTestInductances,
  };
};

const upsert = async (inspNo, userKey, dataUpsert) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const staticTestId = ctx.formStaticTest.sttId;

    if (ctx.staticTestInductances) {
      return await update(dataUpsert, staticTestId, userKey);
    }

    const generatedRows = generate(staticTestId, userKey);
    const finalRows = merge(generatedRows, dataUpsert);

    await db.StaticTestInductance.bulkCreate(finalRows);

    const staticTestInductances = await db.StaticTestInductance.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: true,
      data: {
        staticTestInductances,
      },
    };
  } catch (err) {
    throw err;
  }
};

const update = async (dataUpdate, staticTestId, userKey) => {
  try {
    for (const data of dataUpdate) {
      await db.StaticTestInductance.update(
        { ...data, updatedBy: userKey },
        {
          where: {
            staticTestId: staticTestId,
            sectionType: data.sectionType,
          },
        },
      );
    }

    const staticTestInductances = await db.StaticTestInductance.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: false,
      data: {
        staticTestInductances,
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

    if (!ctx.staticTestInductances) {
      return {
        success: false,
        message: "static test inductances not found.",
      };
    }

    return {
      success: true,
      data: {
        staticTestInductances: ctx.staticTestInductances,
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

    if (!ctx.staticTestInductances) {
      return {
        success: false,
        message: "static test inductances not found.",
      };
    }
    await db.StaticTestInductance.destroy({
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
