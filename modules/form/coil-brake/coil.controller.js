const serviceCoil = require("./coil.service");
const resUtil = require("../../../utils/response.util");
const { coilBrake } = require("./coil.serializer");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceCoil.save(inspNo, req.userKey, req.body);
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

module.exports = { save };
