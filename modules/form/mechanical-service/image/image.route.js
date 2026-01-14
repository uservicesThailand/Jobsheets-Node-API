const express = require("express");
const multer = require("multer");
const controller = require("./image.controller");
const {
  uploadErrorHandler,
  uploader,
} = require("../../../../middlewares/upload.middleware");
const {
  MAX_FILE_SIZE,
  MAX_IMAGES_PER_FORM,
  ALLOWED_MIME_TYPES,
} = require("./image.constants");

const router = express.Router();

router.post(
  "/:inspNo",
  uploader("files", MAX_IMAGES_PER_FORM, MAX_FILE_SIZE, ALLOWED_MIME_TYPES),
  uploadErrorHandler,
  controller.uploadImages
);

module.exports = router;
