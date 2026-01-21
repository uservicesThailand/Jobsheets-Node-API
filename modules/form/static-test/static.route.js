const express = require("express");
const controller = require("./static.controller");
const validator = require("./static.validator");
const validate = require("../../../middlewares/validate.middleware");

const sectionRouter = require("./section/section.route");
const resistanceRouter = require("./resistance/resistance.route");
const inductanceRouter = require("./inductance/inductance.route");
const insulationRouter = require("./insulation/insulation.route");

const router = express.Router();

router.use("/section", sectionRouter);
router.use("/resistance", resistanceRouter);
router.use("/inductance", inductanceRouter);
router.use("/insulation", insulationRouter);

router.post("/:inspNo", validator.create, validate, controller.save);
router.get("/:inspNo", controller.get);
router.delete("/:inspNo", controller.remove);

module.exports = router;
