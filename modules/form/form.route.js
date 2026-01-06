const express = require("express");
const controller = require("./form.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

// rotor
router.post("/rotor/:inspNo", authMiddleware, controller.createRoter);

module.exports = router;
