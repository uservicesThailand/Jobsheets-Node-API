const express = require("express");
const controller = require("./coil.controller");
const validator = require("./coil.validator");
const validate = require("../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.create, validate, controller.save);

module.exports = router;
