const serviceInsulation = require("./insulation.service");
const resUtil = require("../../../../utils/response.util");
const { insulationTest } = require("./insulation.serializer");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceInsulation.save(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      insulationTest(result.data),
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

    const result = await serviceInsulation.get(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      insulationTest(result.data),
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
