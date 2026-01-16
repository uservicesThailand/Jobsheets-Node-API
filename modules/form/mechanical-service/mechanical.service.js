const db = require("../../../models");
const schemas = require("./mechanical.schemas");
const { prepareData } = require("./mechanical.serializer");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormMechanicalService,
      },
    ],
  });

  if (!inspection) {
    return {
      success: false,
      message: "Inspection not found",
    };
  }

  const formMechanicalService = inspection.FormMechanicalService || null;

  return {
    success: true,
    inspection,
    formMechanicalService,
  };
};

const upsert = async (inspNo, userKey, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    body.data = prepareData(
      body.data,
      ctx.formMechanicalService?.data,
      schemas
    );

    const payload = {
      ...body,
      updatedBy: userKey,
    };

    if (ctx.formMechanicalService) {
      await ctx.formMechanicalService.update(payload);
      return {
        success: true,
        created: false,
        data: { formMechanicalService: ctx.formMechanicalService },
      };
    }

    payload.inspId = ctx.inspection.inspId;
    payload.createdBy = userKey;
    const formMechanicalService = await db.FormMechanicalService.create(
      payload
    );
    await formMechanicalService.reload();

    return {
      success: true,
      created: true,
      data: { formMechanicalService },
    };
  } catch (err) {
    throw err;
  }
};

const get = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.formMechanicalService) {
      return {
        success: false,
        message: "form mechanical service not found.",
      };
    }

    return {
      success: true,
      data: { formMechanicalService: ctx.formMechanicalService },
    };
  } catch (err) {
    throw err;
  }
};

const remove = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.formMechanicalService) {
      return {
        success: false,
        message: "form mechanical service not found.",
      };
    }
    await ctx.formMechanicalService.destroy();
    return {
      success: true,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = { upsert, get, remove };
