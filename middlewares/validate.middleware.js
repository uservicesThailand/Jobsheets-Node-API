const { validationResult } = require("express-validator");
const { failResponse } = require("../utils/response.util");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return failResponse(
      res,
      errors.array().map((e) => `${e.param}: ${e.msg}`),
      422
    );
  }
  next();
};
