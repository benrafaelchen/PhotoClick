const express = require("express");
const {
  getUser,
  addUser,
  forgotPassword,
  getUserDetails,
  updateUserDetails,
  createOrder,
} = require("../controllers/user");

const router = express.Router();

router.post("/signin", getUser);
router.post("/signup", addUser);
router.post("/forgotpassword", forgotPassword);
router.post("/getUserData", getUserDetails);
router.post("/updateUserData", updateUserDetails);
router.post("/createOrder", createOrder);

module.exports = router;
