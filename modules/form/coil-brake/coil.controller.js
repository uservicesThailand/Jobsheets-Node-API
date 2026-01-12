const serviceCoil = require("./coil.service");
const resUtil = require("../../../utils/response.util");
// const { balance } = require("./balance.serializer");

const create = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceCoil.create(inspNo, req.userKey);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(res, null, "created successfully", 201);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { create };
