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
  controller.createRotorBalance
);
// router.post("/balance/rotor/runout/:inspNo", authMiddleware, controller.createRotor);
// router.post("/balance/rotor/runout/result/:inspNo", authMiddleware, controller.createRotor);

module.exports = router;
