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

const saveRotor = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.saveRotor(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(
      res,
      rotor(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
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

const saveRotorBalance = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.saveRotorBalance(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(
      res,
      rotorBalance(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
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
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const saveRotorRunout = async (req, res) => {
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

    const result = await rotorService.saveRotorRunout(inspNo, req.body.data);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorRunout(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getRotorRunout = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.getRotorRunout(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorRunout(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const saveRotorRunoutResult = async (req, res) => {
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

    const result = await rotorService.saveRotorRunoutResult(
      inspNo,
      req.body.data
    );
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorRunoutResult(result.data),
      result.created ? "created successfully" : "updated successfully",
      result.created ? 201 : 200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getRotorRunoutResult = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await rotorService.getRotorRunoutResult(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      rotorRunoutResult(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = {
  saveRotor,
  saveRotorBalance,
  saveRotorRunout,
  saveRotorRunoutResult,
  getRotor,
  getRotorBalance,
  getRotorRunout,
  getRotorRunoutResult,
};
