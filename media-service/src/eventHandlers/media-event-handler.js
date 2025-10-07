const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  logger.info("eventeventevent", event);
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });
    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Deleted media ${media?._id} associated with this post ${postId}`
      );
    }

    logger.info(`Porcessed deletion of media for post if ${postId}`);
  } catch (error) {
    logger.error(error, "Error occured while media deletion");
  }
};

module.exports = { handlePostDeleted };
