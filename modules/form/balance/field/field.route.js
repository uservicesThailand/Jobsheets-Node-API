const express = require("express");
const controller = require("./field.controller");
const validator = require("./field.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.createField, validate, controller.create);
router.post(
  "/position/:inspNo",
  validator.createPosition,
  validate,
  controller.createPosition
);
router.post(
  "/location/:inspNo",
  validator.createLocation,
  validate,
  controller.createLocation
);

module.exports = router;
