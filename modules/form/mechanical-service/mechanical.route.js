const express = require("express");

const imageRouter = require("./image/image.route");

const router = express.Router();

router.use("/image", imageRouter);

module.exports = router;
