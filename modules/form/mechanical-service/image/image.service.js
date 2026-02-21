const { uploadFile } = require("../../../../utils/blob.util");
const db = require("../../../../models");
const { BLOB_BASE_PATH, MAX_IMAGES_PER_FORM } = require("./image.constants");

const resolveFieldContext = async (inspNo) => {
  const inspection = await db.TblInspectionList.findOne({
    where: { inspNo },
    include: [
      {
        model: db.FormMechanicalService,
        include: [
          {
            model: db.MechanicalServiceImage,
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

  const formMechanicalService = inspection.FormMechanicalService;
  if (!formMechanicalService) {
    return {
      success: false,
      message: "Form mechanical service not found",
    };
  }

  const mechanicalServiceImages =
    formMechanicalService.MechanicalServiceImages || null;

  return {
    success: true,
    inspection,
    formMechanicalService,
    mechanicalServiceImages,
  };
};

const uploadImages = async (inspNo, files) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (ctx.mechanicalServiceImages) {
      const existingCount = ctx.mechanicalServiceImages.length;
      const incomingCount = files.length;
      const max = MAX_IMAGES_PER_FORM;
      const remaining = Math.max(0, max - existingCount);
      if (incomingCount > remaining) {
        return {
          success: false,
          message: `Image limit ${existingCount}/${max}. Remaining ${remaining} slot(s).`,
        };
      }
    }
    const results = [];

    for (const file of files) {
      const uploaded = await uploadFile({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        folder: `${BLOB_BASE_PATH}/${inspNo}`,
      });

      results.push({
        formId: ctx.formMechanicalService.mcsId,
        fileName: uploaded.fileName,
        filePath: uploaded.blobPath,
        mimeType: file.mimetype,
        fileSize: file.size,
      });
    }

    await db.MechanicalServiceImage.bulkCreate(results);

    const mechanicalServiceImages = await db.MechanicalServiceImage.findAll({
      where: {
        formId: ctx.formMechanicalService.mcsId,
      },
    });

    return {
      success: true,
      data: {
        mechanicalServiceImages,
      },
    };
  } catch (err) {
    throw err;
  }
};

const getImages = async (inspNo) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    if (!ctx.mechanicalServiceImages) {
      return {
        success: false,
        message: "images not found",
      };
    }

    return {
      success: true,
      data: {
        mechanicalServiceImages: ctx.mechanicalServiceImages,
      },
    };
  } catch (error) {
    throw error;
  }
};

const deleteImage = async (inspNo, imageId) => {
  try {
    const ctx = await resolveFieldContext(inspNo);
    if (!ctx.success) return ctx;

    const image = await db.MechanicalServiceImage.findOne({
      where: {
        id: imageId,
        formId: ctx.formMechanicalService.mcsId,
      },
    });

    if (!image) {
      return {
        success: false,
        message: "Image not found",
      };
    }

    await image.destroy();

    return { success: true };
  } catch (err) {
    throw err;
  }
};

module.exports = { uploadImages, getImages, deleteImage };
