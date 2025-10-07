const express=require('express');

const{searchPostController}=require('../controllers/search-controller')
const {authenticateRequest}=require('../middlewares/authMiddleware')

const router=express.Router();

router.use(authenticateRequest);
router.get('/searchposts',searchPostController)

module.exports=router;