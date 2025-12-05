const express = require("express");
const authService = require("../services/authService");
const router = express.Router();

router.post("/signup", authService.signup);
router.post("/signin", authService.signin);

module.exports = router;
