const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const balanceRouter = require("./balance/balance.route");
const coilRouter = require("./coil-brake/coil.route");
const mechanicalServiceRouter = require("./mechanical-service/mechanical.route");
const electricalServiceRouter = require("./electrical-service/electrical.route");

const router = express.Router();

router.use("/balance", auth, balanceRouter);
router.use("/coil-brake", auth, coilRouter);
router.use("/mechanical-service", auth, mechanicalServiceRouter);
router.use("/electrical-service", auth, electricalServiceRouter);

module.exports = router;
