const express = require("express");

const formRoute = require("./modules/form/form.route");

const router = express.Router();

router.use("/form", formRoute);

module.exports = router;
