const express = require("express");
const controller = require("./resistance.controller");
const validator = require("./resistance.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.create, validate, controller.save);
router.get("/:inspNo",  controller.get);

module.exports = router;
