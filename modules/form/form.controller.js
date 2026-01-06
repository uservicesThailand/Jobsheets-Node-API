const formService = require("./form.service");
const resUtil = require("../../util/response.util");

const get = async (req, res, next) => {
  try {
    const result = await formService.get();
    return resUtil.successResponse(res, null, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { get };
