const express = require("express");
const router = express.Router();
const authService = require("../Services/auth.service")

router.post("/register", authService.register);
router.post("/login", authService.login);
router.post("/forgotpassword", authService.forgotpassword);
router.post("/resetpassword", authService.resetpassword);

module.exports = router;