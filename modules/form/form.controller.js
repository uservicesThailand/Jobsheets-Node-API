const formService = require("./form.service");
const resUtil = require("../../utils/response.util");

const createRoter = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await formService.createRoter(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(res, null);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { createRoter };
