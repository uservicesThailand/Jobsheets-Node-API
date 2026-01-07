const balanceService = require("./balance.service");
const resUtil = require("../../../utils/response.util");
const { rotorSerializer } = require("./balance.serializer");

const createRotor = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await balanceService.createRotor(
      inspNo,
      req.userKey,
      req.body
    );
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorSerializer(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const createRotorBalance = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await balanceService.createRotorBalance(
      inspNo,
      req.userKey,
      req.body
    );
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(res, rotorSerializer(result.data));
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { createRotor, createRotorBalance };
