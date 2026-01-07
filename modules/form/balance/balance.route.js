const express = require("express");
const controller = require("./balance.controller");
const validator = require("./balance.validator");
const validate = require("../../../middlewares/validate.middleware");

const router = express.Router();

// rotor
router.post(
  "/rotor/:inspNo",
  validator.createRotor,
  validate,
  controller.createRotor
);

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
