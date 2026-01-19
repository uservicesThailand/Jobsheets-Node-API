const service = require("./electrical.service");
const {
  validatePayload,
} = require("../mechanical-service/mechanical.validator");
const schemas = require("./electrical.schemas");
const resUtil = require("../../../utils/response.util");
const { mapResponse } = require("./electrical.serializer");

const save = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const errors = validatePayload(req.body.data, schemas);

    if (errors.length) {
      return resUtil.failResponse(
        res,
        errors.map((e) => e),
        422
      );
    }

    const result = await service.upsert(inspNo, req.userKey, req.body);
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

    const result = await service.get(inspNo);
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

const remove = async (req, res) => {
  try {
    const { inspNo } = req.params;

    const result = await service.remove(inspNo);
    if (!result.success) {
      return resUtil.failResponse(res, result.message);
    }
    return resUtil.successResponse(res, null, "deleted successfully", 200);
  } catch (err) {
    return resUtil.errorResponse(res, err.message);
  }
};

module.exports = { save, get, remove };
