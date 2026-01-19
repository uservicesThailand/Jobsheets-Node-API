const resUtil = require("../../../../utils/response.util");
const serviceShaft = require("./shaft.service");
const { shaft, shaftBalance } = require("./shaft.serializer");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceShaft.save(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      shaft(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const saveBalance = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceShaft.saveBalance(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      shaftBalance(result.data),
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

    const result = await serviceShaft.get(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      shaft(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getBalance = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceShaft.getBalance(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      shaftBalance(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { save, saveBalance, get, getBalance };
