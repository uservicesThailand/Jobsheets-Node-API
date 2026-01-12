const express = require("express");
const controller = require("./field.controller");
const validator = require("./field.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.createField, validate, controller.save);
router.get("/:inspNo", controller.get);

router.post(
  "/position/:inspNo",
  validator.createPosition,
  validate,
  controller.savePosition
);
router.get("/position/:inspNo", controller.getPosition);

router.post(
  "/location/:inspNo",
  validator.createLocation,
  validate,
  controller.saveLocation
);
router.get("/location/:inspNo", controller.getLocation);

module.exports = router;
