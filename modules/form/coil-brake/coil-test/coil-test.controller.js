const serviceCoilTest = require("./coil-test.service");
const resUtil = require("../../../../utils/response.util");
const { mapResponse } = require("./coil-test.serializer");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceCoilTest.save(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      mapResponse(result.data),
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

    const result = await serviceCoilTest.get(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      mapResponse(result.data),
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
