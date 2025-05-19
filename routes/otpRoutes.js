const express = require('express');
const router = express.Router();
const otpController = require('../controller/otpController');

// Route to send OTP
router.post("/sendotp", otpController.sendOtp);

// Route to verify OTP
router.post('/verifyotp', otpController.verifyOtp); 
module.exports = router;