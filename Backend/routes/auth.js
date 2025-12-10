const express = require("express");
const authService = require("../services/authService");
const router = express.Router();

router.post("/send-verification-code", authService.sendVerificationCode);
router.post("/verify-code", authService.verifyCode);
router.post("/signup", authService.signup);
router.post("/signin", authService.signin);
router.post("/forgot-password", authService.forgotPassword);
router.post("/reset-password", authService.resetPassword);

module.exports = router;
