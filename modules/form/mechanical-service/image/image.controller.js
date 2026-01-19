const service = require("./image.service");
const resUtil = require("../../../../utils/response.util");
const { mapResponse } = require("./image.serializer");

const uploadImages = async (req, res) => {
  try {
    const { inspNo } = req.params;
    const result = await service.uploadImages(inspNo, req.files);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      mapResponse(result.data),
      "Images uploaded",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getImages = async (req, res) => {
  try {
    const { inspNo } = req.params;
    const result = await service.getImages(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      mapResponse(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const deleteImage = async (req, res) => {
  try {
    const { inspNo, imageId } = req.params;

    const result = await service.deleteImage(inspNo, imageId);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(res, null, "Image deleted", 200);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { uploadImages, getImages, deleteImage };
