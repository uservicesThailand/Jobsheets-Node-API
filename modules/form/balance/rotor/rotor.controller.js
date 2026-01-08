const rotorService = require("./rotor.service");
const resUtil = require("../../../../utils/response.util");
const {
  rotor,
  rotorBalance,
  rotorRunout,
  rotorRunoutResult,
} = require("./rotor.serializer");
const {
  validateRunoutBusiness,
  validateRunoutResult,
} = require("./rotor.business.validator");

const createRotor = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.createRotor(
      inspNo,
      req.userKey,
      req.body
    );
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotor(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getRotor = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.getRotor(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotor(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const createRotorBalance = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.createRotorBalance(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorBalance(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getRotorBalance = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.getRotorBalance(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorBalance(result.data),
      "fetched successfully",
      202
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const createRotorRunout = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const businessErrors = validateRunoutBusiness(req.body.data);
    if (businessErrors.length > 0) {
      return resUtil.failResponse(
        res,
        businessErrors.map((e) => `row ${e.index}: ${e.message}`),
        422
      );
    }

    const result = await rotorService.createRotorRunout(inspNo, req.body.data);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorRunout(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const createRotorRunoutResult = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const businessErrors = validateRunoutResult(req.body.data);
    if (businessErrors.length > 0) {
      return resUtil.failResponse(
        res,
        businessErrors.map((e) => `row ${e.index}: ${e.message}`),
        422
      );
    }

    const result = await rotorService.createRotorRunoutResult(
      inspNo,
      req.body.data
    );
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorRunoutResult(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = {
  createRotor,
  createRotorBalance,
  createRotorRunout,
  createRotorRunoutResult,
  getRotor,
  getRotorBalance,
};
