const express = require("express");
const controller = require("./health.controller");

const router = express.Router();

router.get("/database", controller.checkDB);

module.exports = router;
