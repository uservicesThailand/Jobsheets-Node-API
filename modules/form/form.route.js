const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const balanceRouter = require("./balance/balance.route");

const router = express.Router();

router.use("/balance", auth, balanceRouter);

module.exports = router;
