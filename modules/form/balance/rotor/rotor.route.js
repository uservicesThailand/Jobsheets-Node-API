const express = require("express");
const controller = require("./rotor.controller");
const validator = require("./rotor.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

// rotor
router.post(
  "/:inspNo",
  validator.createRotor,
  validate,
  controller.createRotor
);

router.get("/:inspNo", controller.getRotor);

router.post(
  "/rotor/balance/:inspNo",
  validator.createRotorBalance,
  validate,
  controller.createRotorBalance
);

router.get("/balance/:inspNo", controller.getRotorBalance);

router.post(
  "/runout/:inspNo",
  validator.createRotorRunout,
  validate,
  controller.createRotorRunout
);

router.get("/runout/:inspNo", controller.getRotorRunout);

router.post(
  "/runout/result/:inspNo",
  validator.createRotorRunoutResult,
  validate,
  controller.createRotorRunoutResult
);

router.get("/runout/result/:inspNo", controller.getRotorRunoutResult);

module.exports = router;
