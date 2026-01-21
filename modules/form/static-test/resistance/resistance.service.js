const db = require("../../../../models");
const { generate, merge } = require("./resistance.serializer");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormStaticTest,
        include: [
          {
            model: db.StaticTestResistance,
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

  const staticTestResistances =
    formStaticTest.StaticTestResistances.length > 0
      ? formStaticTest.StaticTestResistances
      : null;

  return {
    success: true,
    inspection,
    formStaticTest,
    staticTestResistances,
  };
};

const upsert = async (inspNo, userKey, dataUpsert) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const staticTestId = ctx.formStaticTest.sttId;

    if (ctx.staticTestResistances) {
      return await update(dataUpsert, staticTestId, userKey);
    }

    const generatedRows = generate(staticTestId, userKey);
    const finalRows = merge(generatedRows, dataUpsert);

    await db.StaticTestResistance.bulkCreate(finalRows);

    const staticTestResistances = await db.StaticTestResistance.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: true,
      data: {
        staticTestResistances,
      },
    };
  } catch (err) {
    throw err;
  }
};

const update = async (dataUpdate, staticTestId, userKey) => {
  try {
    for (const data of dataUpdate) {
      await db.StaticTestResistance.update(
        { ...data, updatedBy: userKey },
        {
          where: {
            staticTestId: staticTestId,
            sectionType: data.sectionType,
          },
        },
      );
    }

    const staticTestResistances = await db.StaticTestResistance.findAll({
      where: { staticTestId },
    });
    
    return {
      success: true,
      created: false,
      data: {
        staticTestResistances,
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

    if (!ctx.staticTestResistances) {
      return {
        success: false,
        message: "static test resistance not found.",
      };
    }

    return {
      success: true,
      data: {
        staticTestResistances: ctx.staticTestResistances,
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

    if (!ctx.staticTestResistances) {
      return {
        success: false,
        message: "static test resistance not found.",
      };
    }
    await db.StaticTestResistance.destroy({
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
