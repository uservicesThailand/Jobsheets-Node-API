const healthService = require("./health.service");
const resUtil = require("../../utils/response.util");

const checkDB = async (_, res) => {
  try {
    const result = await healthService.getDbHealthStatus();
    return resUtil.successResponse(res, result);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { checkDB };
