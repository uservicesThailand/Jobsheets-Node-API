const formService = require("./form.service");
const resUtil = require("../../util/response.util");

const get = async (_, res) => {
  try {
    const result = await formService.get();
    return resUtil.successResponse(res, null, result);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { get };
