const express = require("express");
const controller = require("./balance.controller");
const rotorRouter = require("./rotor/rotor.route");
const shaftRouter = require("./shaft/shaft.route");

const router = express.Router();

router.use("/rotor", rotorRouter);
router.use("/shaft", shaftRouter);

router.post("/:inspNo", controller.create);
router.get("/:inspNo", controller.get);
router.delete("/:inspNo", controller.remove);

module.exports = router;
