const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("starting media upload");
  try {
    console.log(req.file);

    if (!req.file) {
      logger.error("No file found pls upload the file or try again ");
      return res.status(400).json({
        success: false,
        message: "No file found pls upload the file or try again ",
      });
    }
    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;
    logger.info(`File details : name=${originalname},type=${mimetype}`);
    logger.info("uploading to cloudinary starting ....");

    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfull :Public Id:-${cloudinaryUploadResult.public_id}`
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
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
    logger.error("Error in creating media", error);
    res.status(500).json({
      success: false,
      message: "Error in uploading post",
    });
  }
};

const getAllMedia = async (req, res) => {
  try {
      const result=await Media.find({});
    res.json({result});
  } catch (error) {
    logger.error("Error in fetching all media", error);
    res.status(500).json({
      success: false,
      message: "Error in fetching all media",
    });
  }
};

module.exports = { uploadMedia,getAllMedia };
