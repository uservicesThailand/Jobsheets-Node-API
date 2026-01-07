const express = require("express");
const controller = require("./form.controller");
const formValidator = require("./form.validator");
const authMiddleware = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");

const router = express.Router();

// rotor
router.post(
  "/balance/rotor/:inspNo",
  authMiddleware,
  formValidator.createRotor,
  validate,
  controller.createRotor
);
// router.post("/balance/rotor/balance/:inspNo", authMiddleware, controller.createRotor);
// router.post("/balance/rotor/runout/:inspNo", authMiddleware, controller.createRotor);
// router.post("/balance/rotor/runout/result/:inspNo", authMiddleware, controller.createRotor);

module.exports = router;
