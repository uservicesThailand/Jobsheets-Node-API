const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const rotorRouter = require("./balance/rotor/rotor.route");
const shaftRouter = require("./balance/shaft/shaft.route");

const router = express.Router();

router.use("/balance/rotor", auth, rotorRouter);
router.use("/balance/shaft", auth, shaftRouter);

module.exports = router;
