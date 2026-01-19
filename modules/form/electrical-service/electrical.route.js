const express = require("express");
const controller = require("./electrical.controller");

const router = express.Router();

router.post("/:inspNo", controller.save);
router.get("/:inspNo", controller.get);
router.delete("/:inspNo", controller.remove);

module.exports = router;
