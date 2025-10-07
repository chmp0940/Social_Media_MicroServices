const express = require("express");
const multer = require("multer");

const { uploadMedia, getAllMedia } = require("../controllers/media-controller");
const { authenticateRequest } = require("../middlewares/authMiddleware");
const logger = require("../utils/logger");

const router = express.Router();

// config  multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5mb
  },
}).single("file");

router.post(
  "/upload",
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (error) {
      if (error instanceof multer.MulterError) {
        logger.error("Multer error while uplaoding", error);
        res.status(400).json({
          message: "Multer error",
          error: error.message,
          stack: error.stack,
        });
      } else if (error) {
        logger.error("Unknown error occured", error);
        res.status(500).json({
          message: "Unknown error occured ",
          error: error.message,
          stack: error.stack,
        });
      }

      if (!req.file) {
        logger.error("No file found");
        return res.status(500).json({
          message: "No file found ",
        });
      }
      next();
    });
  },
  uploadMedia
);

router.get("/getallmedia", authenticateRequest, getAllMedia);

module.exports = router;
