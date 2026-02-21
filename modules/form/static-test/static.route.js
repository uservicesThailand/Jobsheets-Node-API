const express = require("express");
const controller = require("./static.controller");
const validator = require("./static.validator");
const validate = require("../../../middlewares/validate.middleware");

const router = express.Router();

router.post("/:inspNo", validator.create, validate, controller.save);
router.get("/:inspNo", controller.get);
router.delete("/:inspNo", controller.remove);

module.exports = router;
