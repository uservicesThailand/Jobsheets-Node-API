const serviceBalance = require("./balance.service");
const { balance } = require("./balance.serializer");

const create = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceBalance.create(inspNo, req.userKey);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      balance(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const get = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceBalance.get(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      balance(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const remove = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceBalance.remove(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(res, null, result.message, 200);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { create, get, remove };
