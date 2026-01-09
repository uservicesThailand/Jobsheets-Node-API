const serviceField = require("./field.service");
const resUtil = require("../../../../utils/response.util");
const { field } = require("./field.serializer");

const create = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceField.create(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      field(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { create };
