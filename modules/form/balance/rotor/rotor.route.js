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

router.get("/rotor/balance/:inspNo", controller.getRotorBalance);

router.post(
  "/rotor/runout/:inspNo",
  validator.createRotorRunout,
  validate,
  controller.createRotorRunout
);

router.get("/rotor/runout/:inspNo", controller.getRotorRunout);

router.post(
  "/rotor/runout/result/:inspNo",
  validator.createRotorRunoutResult,
  validate,
  controller.createRotorRunoutResult
);

router.get("/rotor/runout/result/:inspNo", controller.getRotorRunoutResult);

module.exports = router;
