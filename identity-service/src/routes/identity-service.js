const express = require("express");
const {
  registerUser,
  loginUser,
  refreshTokenController,
  logoutUser,
} = require("../controllers/identity-controller");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refreshtoken", refreshTokenController);
router.post("/logout", logoutUser);

module.exports = router;
