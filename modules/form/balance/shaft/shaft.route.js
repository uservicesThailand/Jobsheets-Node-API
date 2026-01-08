const express = require("express");
const controller = require("./shaft.controller");
const validator = require("./shaft.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.create, validate, controller.create);
router.post(
  "/balance/:inspNo",
  validator.createShaftBalance,
  validate,
  controller.createBalance
);

module.exports = router;
