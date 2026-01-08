const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const rotorRouter = require("./balance/rotor/rotor.route")

const router = express.Router();

router.use("/balance", auth, rotorRouter);

module.exports = router;
