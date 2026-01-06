const express = require("express");
const controller = require("./form.controller");

const router = express.Router();

// rotor
router.post("/rotor/:inspNo", controller.createRoter);

module.exports = router;
