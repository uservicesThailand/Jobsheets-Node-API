const express = require("express");
const controller = require("./form.controller");

const router = express.Router();

router.get("/", controller.get);

module.exports = router;
