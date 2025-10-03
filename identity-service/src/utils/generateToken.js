const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/refreshToken");
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    {
      userId: user?._id,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = crypto.randomBytes(40).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // refresh Token expires in 7days

  await RefreshToken.create({
    token:refreshToken,
    user:user?.id,
    expiresAt
  })
  
return { accessToken, refreshToken };
};


module.exports=generateTokens;
