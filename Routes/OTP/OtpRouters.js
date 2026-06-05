const express = require("express");
const rateLimit = require("express-rate-limit");
const otpRouters = new express.Router();
const otpController = require("../../Controllers/OTP/OTPController");

const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests. Please wait 10 minutes before trying again." },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many verification attempts. Please wait and try again." },
});

otpRouters.post("/otp/send", otpSendLimiter, otpController.sendOtp);
otpRouters.post("/otp/verify", otpVerifyLimiter, otpController.verifyOtp);

module.exports = otpRouters;
