// ` Express route

const express = require("express");
const router = express.Router();

// = authentication middleware

const authMiddleware = require("../middleware/authMiddleware");

// ` userControllers function

const {
  register,
  login,
  checkUser,
  resetPassword,
} = require("../controller/userController");

// ` Register route, use post because we want to access the data

router.post("/register", register);

// ` login user, use post because we want to access the data

router.post("/login", login);

// ` check user (to check authentication)
// * check authentication by middleware
router.get("/check", authMiddleware, checkUser);

// ` reset password
router.use("/reset-password", resetPassword);

// ` export userRouter
module.exports = router;
