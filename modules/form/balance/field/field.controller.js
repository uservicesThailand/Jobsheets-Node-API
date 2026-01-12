const serviceField = require("./field.service");
const resUtil = require("../../../../utils/response.util");
const { field, fieldPositions, fieldLocations } = require("./field.serializer");
const { validateBusiness } = require("./field.business.validator");

const create = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await serviceField.create(inspNo, req.body);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(
      res,
      field(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const createPosition = async (req, res) => {
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

    const result = await serviceField.createPosition(inspNo, req.body.data);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(
      res,
      fieldPositions(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

const createLocation = async (req, res) => {
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

    const result = await serviceField.createLocation(inspNo, req.body.data);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }

    return resUtil.successResponse(
      res,
      fieldLocations(result.data),
      "created successfully",
      201
    );
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { create, createPosition, createLocation };
