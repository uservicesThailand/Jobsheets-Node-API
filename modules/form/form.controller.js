const formService = require("./form.service");
const resUtil = require("../../utils/response.util");
const { rotorSerializer } = require("./form.serializer");

const createRotor = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await formService.createRotor(inspNo, req.userKey, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(res, rotorSerializer(result.data));
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { createRotor };
