// user registration

const RefreshToken = require("../models/refreshToken");
const User = require("../models/User");
const generateTokens = require("../utils/generateToken");
const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");

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
const loginUser = async (req, res) => {
  logger.info("login end point hit...");
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn("validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid User");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // valid password or not
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    const { accessToken, refreshToken } = await generateTokens(user);
    res.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Login error ocured", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
//refresh token
const refreshTokenController = async (req, res) => {
  logger.info("Refresh Token endPoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or Expired refresh TOken");
      return res.status(401).json({
        success: flase,
        message: "Invaild or expired refresh token",
      });
    }
    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }

    const { accessToken: newAcessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);
    // delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({
      accessToken: newAcessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("refresh token error happened", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// logout
const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit ...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh Token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh Token missing",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh Token deleted for logout");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("logout error happened", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = { registerUser, loginUser, refreshTokenController,logoutUser };
