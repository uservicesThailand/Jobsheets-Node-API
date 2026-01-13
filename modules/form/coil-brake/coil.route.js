const express = require("express");
const controller = require("./coil.controller");
const validator = require("./coil.validator");
const validate = require("../../../middlewares/validate.middleware");
const insulationRouter = require("./insulation/insulation.route");

const router = express.Router();

router.use("/insulation", insulationRouter);

router.post("/:inspNo", validator.create, validate, controller.save);
router.get("/:inspNo", controller.get);

module.exports = router;
