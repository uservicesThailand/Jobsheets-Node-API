const db = require("../../../models");
const schemas = require("./electrical.schemas");
const { prepareData } = require("../mechanical-service/mechanical.serializer");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormElectricalService,
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

  const formElectricalService = inspection.FormElectricalService || null;

  return {
    success: true,
    inspection,
    formElectricalService,
  };
};

const upsert = async (inspNo, userKey, body) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    body.data = prepareData(
      body.data,
      ctx.formElectricalService?.data,
      schemas
    );

    const payload = {
      ...body,
      updatedBy: userKey,
    };

    if (ctx.formElectricalService) {
      await ctx.formElectricalService.update(payload);
      const formElectricalService = ctx.formElectricalService;
      return {
        success: true,
        created: false,
        data: {
          formElectricalService: ctx.formElectricalService,
          createdBy: formElectricalService.createdUser,
          updatedBy: formElectricalService.updatedUser,
        },
      };
    }

    payload.inspId = ctx.inspection.inspId;
    payload.createdBy = userKey;
    const formElectricalService = await db.FormElectricalService.create(
      payload
    );
    await formElectricalService.reload({
      include: [
        { model: db.Uuser, as: "createdUser" },
        { model: db.Uuser, as: "updatedUser" },
      ],
    });

    return {
      success: true,
      created: true,
      data: {
        formElectricalService,
        createdBy: formElectricalService.createdUser,
        updatedBy: formElectricalService.updatedUser,
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

    if (!ctx.formElectricalService) {
      return {
        success: false,
        message: "form electrical service not found.",
      };
    }

    return {
      success: true,
      data: {
        formElectricalService: ctx.formElectricalService,
        createdBy: ctx.formElectricalService.createdUser,
        updatedBy: ctx.formElectricalService.updatedUser,
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

    if (!ctx.formElectricalService) {
      return {
        success: false,
        message: "form mechanical service not found.",
      };
    }
    await ctx.formElectricalService.destroy();
    return {
      success: true,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = { upsert, get, remove };
