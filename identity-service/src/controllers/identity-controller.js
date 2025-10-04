// user registration

const User = require("../models/User");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validateRegistration } = require("../utils/validation");

const registerUser = async (req, res) => {
  logger.info("Registration endPoint hit...");
  try {
    // validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password, userName } = req.body;

    let user = await User.findOne({ $or: [{ email }, { userName }] });
    if (user) {
      logger.warn("User Already Exists");
      return res.status(400).json({
        success: false,
        message: "user Already Exists",
      });
    }

    user = new User({ userName, email, password });
    await user.save();
    logger.warn("User saved successfully", user?._id);

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Registration error ocured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// user login

//refresh token

// logout

module.exports={registerUser}
