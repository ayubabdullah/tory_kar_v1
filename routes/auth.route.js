const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  sendSMS,
  checkSMS,
  getAdmins,
} = require("../controllers/auth.controller");

const router = express.Router();

const { protect, authorize } = require("../middlewares/authHandler");

router.post("/register", register);
router.post("/sendsms", sendSMS);
router.post("/checksms", checkSMS);
router.post("/login", login);
router.get("/logout", protect, logout);
router.get("/me", protect, getMe);
router.get("/admins", protect, authorize('admin'), getAdmins);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
