const express = require("express");
const controller = require("./shaft.controller");
const validator = require("./shaft.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.get("/:inspNo", controller.get);
router.get("/balance/:inspNo", controller.getBalance);
router.post("/:inspNo", validator.create, validate, controller.create);
router.post(
  "/balance/:inspNo",
  validator.createShaftBalance,
  validate,
  controller.createBalance
);

module.exports = router;
