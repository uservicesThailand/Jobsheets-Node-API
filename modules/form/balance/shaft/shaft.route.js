const express = require("express");
const controller = require("./shaft.controller");
const validator = require("./shaft.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.create, validate, controller.create);

module.exports = router;
