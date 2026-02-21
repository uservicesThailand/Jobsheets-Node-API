const multer = require("multer");

const { failResponse } = require("../utils/response.util");

const formatBytes = (bytes) => {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const { maxFiles, maxFileSize } = req.uploadConfig;
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return failResponse(
          res,
          `File size too large. Maximum allowed is ${formatBytes(maxFileSize)}`,
          422
        );

      case "LIMIT_FILE_COUNT":
        return failResponse(
          res,
          `Too many files uploaded. Maximum allowed is ${maxFiles} files`,
          422
        );

      case "LIMIT_UNEXPECTED_FILE":
        return failResponse(res, "Unexpected file field", 422);

      default:
        return failResponse(res, err.message || "Upload error", 422);
    }
  }

  if (err.code === "INVALID_FILE_TYPE") {
    return failResponse(res, err.message, 422);
  }

  next(err);
};

const uploader = (
  fieldName,
  maxFiles = 1,
  maxFileSize,
  allowedMimeTypes = []
) => {
  return (req, res, next) => {
    req.uploadConfig = {
      maxFiles,
      maxFileSize,
      allowedMimeTypes,
    };

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        files: maxFiles,
        fileSize: maxFileSize,
      },
      fileFilter(_, file, cb) {
        if (
          allowedMimeTypes.length &&
          !allowedMimeTypes.includes(file.mimetype)
        ) {
          const err = new Error(
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`
          );
          err.code = "INVALID_FILE_TYPE";
          return cb(err);
        }
        cb(null, true);
      },
    }).array(fieldName);

    upload(req, res, next);
  };
};

module.exports = { uploadErrorHandler, uploader };
