const Search = require("../models/Search");
const logger = require("../utils/logger");


async function hanldePostCreated(event) {
  try {
    const newSearchPost=new Search({
      postId:event.postId,
      userId:event.userId,
      content:event.content,
      createdAt:event.createdAt
    })

    await newSearchPost.save();

    logger.info(`Search post created ${event.postId}`)
    
  } catch (error) {
    logger.error(error,'error handling post creating event')
  }
}

async function handlePostDeleted(event) {
  try {
    await Search.findOneAndDelete({postId:event.postId});

    logger.info(`Search post deleted ${event.postId}`);
  } catch (error) {
    logger.error(error,"error handling in psot delting event")
  }
}

module.exports={hanldePostCreated,handlePostDeleted};