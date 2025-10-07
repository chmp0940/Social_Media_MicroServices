const Post = require("../models/Post");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitMq");
const { validateCreatePost } = require("../utils/validation");

async function invalidatePostCache(req, input) {
  const keys1 = await req.redisClient.keys("posts:*");
  const keys2 = await req.redisClient.keys("post:*");

  if (keys1.length > 0) {
    await req.redisClient.del(keys1);
  }
  if (keys2.length > 0) {
    await req.redisClient.del(keys2);
  }
}

const createPost = async (req, res) => {
  logger.info("create Post end point hit ...");
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();

    await publishEvent('post.created',{
      postId:newlyCreatedPost._id.toString(),
      userId:newlyCreatedPost.user.toString(),
      content:newlyCreatedPost.content,
      createdAt:newlyCreatedPost.createdAt
    })

    await invalidatePostCache(req, newlyCreatedPost._id.toString());
    logger.info("Post created successfully", newlyCreatedPost);
    res.status(201).json({
      success: true,
      message: "Post created successffully",
    });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
    });
  }
};

const getPost = async (req, res) => {
  logger.info("get Post end point hit ...");
  try {
    const postId = req.params.id;
    const cacheKey = `post:${postId}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      logger.info("caching used by redis");
      return res.json(JSON.parse(cachedPost));
    }

    const singlePost = await Post.findById(postId);

    if (!singlePost) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await req.redisClient.setex(cacheKey, 3600, JSON.stringify(singlePost));

    res.json(singlePost);
  } catch (error) {
    logger.error("Error int fetching post", error);
    res.status(500).json({
      success: false,
      message: "Error in fetching post",
    });
  }
};

const getAllPost = async (req, res) => {
  logger.info("get All Post end point hit ...");
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;
    const cachedPost = await req.redisClient.get(cacheKey);

    if (cachedPost) {
      logger.info("caching used by redis");
      return res.json(JSON.parse(cachedPost));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const totalNoOfPosts = await Post.countDocuments();

    const results = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPost: totalNoOfPosts,
    };

    await req.redisClient.setex(cacheKey, 300, JSON.stringify(results));
    res.json(results);
  } catch (error) {
    logger.error("Error int fetching all post", error);
    res.status(500).json({
      success: false,
      message: "Error in fetching all post",
    });
  }
};

const deletePost = async (req, res) => {
  logger.info("delete Post end point hit ...");
  try {
    const deletePostId = req.params.id;

    const post = await Post.findByIdAndDelete({
      _id:deletePostId,
      user:req.user.userId
    });
    if (!post) {
      logger.warn("deletePost id not present");
      return res.status(404).json({
        message: "not able to find and delete post with this id",
        success: false,
      });
    }

    // publish post delete method ->
    // this method is defined in rabbit mq file pls see it 
    await publishEvent('post.deleted',{
      postId:post._id.toString(),
      userId:req.user.userId,
      mediaIds:post.mediaIds
    })

    await invalidatePostCache(req, post._id.toString());

    res.status(200).json({
      message: "successfully deleted the post",
      success: true,
    });
  } catch (error) {
    logger.error("Error int deleting post", error);
    res.status(500).json({
      success: false,
      message: "Error in deleting post",
    });
  }
};

module.exports = { createPost, getPost, getAllPost, deletePost };
