const serviceResistance = require("./resistance.service");
const resUtil = require("../../../../utils/response.util");
const { resistanceTest } = require("./resistance.serializer");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceResistance.save(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      resistanceTest(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const get = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceResistance.get(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      resistanceTest(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = {
  save,
  get,
};
