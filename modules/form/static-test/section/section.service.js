const db = require("../../../../models");
const { generate, merge } = require("./section.serializer");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormStaticTest,
        include: [
          {
            model: db.StaticTestSection,
            include: [
              { model: db.Uuser, as: "createdUser" },
              { model: db.Uuser, as: "updatedUser" },
            ],
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

  const staticTestSections = formStaticTest.StaticTestSections || null;

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

    if (ctx.staticTestSections.length > 0) {
      return await update(dataUpsert, staticTestId, userKey);
    }

    const generatedRows = generate(staticTestId, userKey);
    const finalRows = merge(generatedRows, dataUpsert);

    await db.StaticTestSection.bulkCreate(finalRows);

    const staticTestSections = await db.StaticTestSection.findAll({
      where: { staticTestId },
      include: [
        { model: db.Uuser, as: "createdUser" },
        { model: db.Uuser, as: "updatedUser" },
      ],
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
      await db.BalanceFieldPosition.update(
        { ...dataUpdate, updatedBy: userKey },
        {
          where: {
            staticTestId: staticTestId,
            sectionType: data.sectionType,
          },
        },
      );
    }

    const staticTestSections = await db.StaticTestSection.findAll({
      where: { staticTestId },
      include: [
        { model: db.Uuser, as: "createdUser" },
        { model: db.Uuser, as: "updatedUser" },
      ],
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
