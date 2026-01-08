const express = require("express");
const controller = require("./rotor.controller");
const validator = require("./rotor.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

// rotor
router.post(
  "/rotor/:inspNo",
  validator.createRotor,
  validate,
  controller.createRotor
);

router.get("/rotor/:inspNo", controller.getRotor);

router.post(
  "/rotor/balance/:inspNo",
  validator.createRotorBalance,
  validate,
  controller.createRotorBalance
);

router.post(
  "/rotor/runout/:inspNo",
  validator.createRotorRunout,
  validate,
  controller.createRotorRunout
);

router.post(
  "/rotor/runout/result/:inspNo",
  validator.createRotorRunoutResult,
  validate,
  controller.createRotorRunoutResult
);

module.exports = router;
