const db = require("../../../../models");
const { generate, merge } = require("./section.serializer");
const {
  MARKING_BY_CIRCUIT: RESISTANCE_MARKING_BY_CIRCUIT,
} = require("../resistance/resistance.constants");

const {
  MARKING_BY_CIRCUIT: INDUCTANCE_MARKING_BY_CIRCUIT,
} = require("../inductance/inductance.constants");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormStaticTest,
        include: [
          {
            model: db.StaticTestSection,
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

  const staticTestSections =
    formStaticTest.StaticTestSections.length > 0
      ? formStaticTest.StaticTestSections
      : null;

  return {
    success: true,
    inspection,
    formStaticTest,
    staticTestSections,
  };
};

const upsert = async (inspNo, userKey, dataUpsert) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const staticTestId = ctx.formStaticTest.sttId;

    if (ctx.staticTestSections) {
      return await update(dataUpsert, staticTestId, userKey);
    }

    const generatedRows = generate(staticTestId, userKey);
    const finalRows = merge(generatedRows, dataUpsert);

    await db.StaticTestSection.bulkCreate(finalRows);

    const staticTestSections = await db.StaticTestSection.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: true,
      data: {
        staticTestSections: staticTestSections,
      },
    };
  } catch (err) {
    throw err;
  }
};

const update = async (dataUpdate, staticTestId, userKey) => {
  try {
    for (const data of dataUpdate) {
      await db.StaticTestSection.update(
        { ...data, updatedBy: userKey },
        {
          where: {
            staticTestId: staticTestId,
            sectionType: data.sectionType,
          },
        },
      );

      if (data.circuitType) {
        const resistance_marking =
          RESISTANCE_MARKING_BY_CIRCUIT[data.circuitType];
        const inductance_marking =
          INDUCTANCE_MARKING_BY_CIRCUIT[data.circuitType];

        await db.StaticTestResistance.update(
          {
            marking1: resistance_marking[0],
            marking2: resistance_marking[1],
            marking3: resistance_marking[2],
          },
          {
            where: {
              staticTestId: staticTestId,
              sectionType: data.sectionType,
            },
          },
        );

        await db.StaticTestInductance.update(
          {
            marking1: inductance_marking[0],
            marking2: inductance_marking[1],
            marking3: inductance_marking[2],
          },
          {
            where: {
              staticTestId: staticTestId,
              sectionType: data.sectionType,
            },
          },
        );
      }
    }

    const staticTestSections = await db.StaticTestSection.findAll({
      where: { staticTestId },
    });

    return {
      success: true,
      created: false,
      data: {
        staticTestSections: staticTestSections,
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

    if (!ctx.staticTestSections) {
      return {
        success: false,
        message: "static test section not found.",
      };
    }

    return {
      success: true,
      data: {
        staticTestSections: ctx.staticTestSections,
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

    if (!ctx.staticTestSections) {
      return {
        success: false,
        message: "static test section not found.",
      };
    }
    await db.StaticTestSection.destroy({
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
