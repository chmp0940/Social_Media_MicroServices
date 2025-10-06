const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("starting media upload");
  try {
    if (!req.file) {
      logger.error("No file found pls upload the file or try again ");
      return res.status(400).json({
        success: false,
        message: "No file found pls upload the file or try again ",
      });
    }
    const { originalName, mimeType, buffer } = req.file;
    const userId = req.user.userId;
    logger.info(`File details : name=${originalName},type=${mimeType}`);
    logger.info("uploading to cloudinary starting ....");

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfull :Public Id:-${cloudinaryUploadResult.public_id}`
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName,
      mimeType,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "media successfully uploaded",
    });
  } catch (error) {
    logger.error("Error int uploading post", error);
    res.status(500).json({
      success: false,
      message: "Error in uploading post",
    });
  }
};

module.exports = { uploadMedia };
