const express = require("express");

const formRoute = require("./modules/form/form.route");
const healthRoute = require("./modules/health/health.route");

const router = express.Router();

router.use("/form", formRoute);
router.use("/health", healthRoute);

module.exports = router;
