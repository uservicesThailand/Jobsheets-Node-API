const express = require("express");
const controller = require("./coil-test.controller");
const validator = require("./coil-test.validator");
const validate = require("../../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.create, validate, controller.save);
router.get("/:inspNo",  controller.get);

module.exports = router;
