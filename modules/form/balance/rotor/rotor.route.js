const express = require("express");
const controller = require("./rotor.controller");
const validator = require("./rotor.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

// rotor
router.post("/:inspNo", validator.createRotor, validate, controller.saveRotor);

router.get("/:inspNo", controller.getRotor);

router.post(
  "/balance/:inspNo",
  validator.createRotorBalance,
  validate,
  controller.saveRotorBalance
);

router.get("/balance/:inspNo", controller.getRotorBalance);

router.post(
  "/runout/:inspNo",
  validator.createRotorRunout,
  validate,
  controller.saveRotorRunout
);

router.get("/runout/:inspNo", controller.getRotorRunout);

router.post(
  "/runout/result/:inspNo",
  validator.createRotorRunoutResult,
  validate,
  controller.saveRotorRunoutResult
);

router.get("/runout/result/:inspNo", controller.getRotorRunoutResult);

module.exports = router;
