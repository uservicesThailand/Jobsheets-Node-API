const serviceField = require("./field.service");
const resUtil = require("../../../../utils/response.util");
const { field, fieldPositions, fieldLocations } = require("./field.serializer");
const { validateBusiness } = require("./field.business.validator");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceField.save(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      field(result.data),
      result.action === "created"
        ? "created successfully"
        : "updated successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const get = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceField.get(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      field(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const savePosition = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const businessErrors = validateBusiness(req.body.data, "positionIndex");
    if (businessErrors.length > 0) {
      return resUtil.failResponse(
        res,
        businessErrors.map((e) => e),
        422
      );
    }

    const result = await serviceField.savePosition(inspNo, req.body.data);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(
      res,
      fieldPositions(result.data),
      result.action === "created"
        ? "created successfully"
        : "updated successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getPosition = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceField.getPosition(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      fieldPositions(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const saveLocation = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const businessErrors = validateBusiness(req.body.data, "location");
    if (businessErrors.length > 0) {
      return resUtil.failResponse(
        res,
        businessErrors.map((e) => e),
        422
      );
    }

    const result = await serviceField.saveLocation(inspNo, req.body.data);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(
      res,
      fieldLocations(result.data),
      result.action === "created"
        ? "created successfully"
        : "updated successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const getLocation = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceField.getLocation(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      fieldLocations(result.data),
      "fetched successfully",
      200
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = {
  save,
  savePosition,
  saveLocation,
  get,
  getPosition,
  getLocation,
};
