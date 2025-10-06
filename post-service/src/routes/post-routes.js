const express = require("express");
const { createPost,getAllPost ,getPost, deletePost} = require("../controllers/postController");
const { authenticateRequest } = require("../middlewares/authMiddleware");

const router = express.Router();
// middlewaer -> this will tell fi the use is authenticated or not
router.use(authenticateRequest);
router.post("/create", createPost);
router.get("/getallposts", getAllPost);
router.get("/getsinglepost/:id", getPost);
router.delete('/deletepost/:id',deletePost)
module.exports = router;
