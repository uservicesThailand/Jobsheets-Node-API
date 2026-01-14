const service = require("./image.service");
const resUtil = require("../../../../utils/response.util");

const uploadImages = async (req, res) => {
  try {
    const { inspNo } = req.params;
    return resUtil.failResponse(res, req.params);
    const result = await service.uploadImages(inspNo, req.files);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      coilBrake(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { uploadImages };
