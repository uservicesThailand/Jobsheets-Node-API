const express = require("express");
const controller = require("./mechanical.controller");
const imageRouter = require("./image/image.route");
const validator = require("./mechanical.validator");
const validate = require("../../../middlewares/validate.middleware");

const router = express.Router();

router.use("/image", imageRouter);

router.post("/:inspNo", validator.create, validate, controller.save);

module.exports = router;
