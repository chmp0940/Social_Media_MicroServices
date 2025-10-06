const logger = require("../utils/logger");
const jwt=require('jsonwebtoken')

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // as the auth header is of two parts <typeofheader> <the tokken>
  if(!token)
  {
    logger.warn('Access attempt without valid token')
    return res.status(401).json({
      message:'Authentication Required',
      success:false
    })
  }

  jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
    if(err)
    {
      logger.warn("Invalid token");
      return res.status(429).json({
        message: "Invalid Token",
        success: false,
      });
    }
    req.user=user;
    next();
  })
};

module.exports={validateToken};
