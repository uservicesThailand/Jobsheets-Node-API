const db = require("../../../models");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormStaticTest,
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
      message: "Inspection not found",
    };
  }

  const formStaticTest = inspection.FormStaticTest || null;

  return {
    success: true,
    inspection,
    formStaticTest,
  };
};

const upsert = async (inspNo, userKey, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const payload = {
      ...body,
      updatedBy: userKey,
    };

    if (ctx.formStaticTest) {
      await ctx.formStaticTest.update(payload);
      return {
        success: true,
        created: false,
        data: {
          formStaticTest: ctx.formStaticTest,
          inspection: ctx.inspection,
          createdBy: ctx.formStaticTest.createdUser,
          updatedBy: ctx.formStaticTest.updatedUser,
        },
      };
    }

    payload.inspId = ctx.inspection.inspId;
    payload.createdBy = userKey;
    const formStaticTest = await db.FormStaticTest.create(payload);
    await formStaticTest.reload({
      include: [
        { model: db.Uuser, as: "createdUser" },
        { model: db.Uuser, as: "updatedUser" },
      ],
    });

    return {
      success: true,
      created: true,
      data: {
        formStaticTest,
        inspection: ctx.inspection,
        createdBy: formStaticTest.createdUser,
        updatedBy: formStaticTest.updatedUser,
      },
    };
  } catch (err) {
    throw err;
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.formStaticTest) {
      return {
        success: false,
        message: "form static test not found.",
      };
    }

    return {
      success: true,
      data: {
        formStaticTest: ctx.formStaticTest,
        inspection: ctx.inspection,
        createdBy: ctx.formStaticTest.createdUser,
        updatedBy: ctx.formStaticTest.updatedUser,
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

    if (!ctx.formStaticTest) {
      return {
        success: false,
        message: "form static test not found.",
      };
    }
    await ctx.formStaticTest.destroy();
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
