const express = require("express");
const paymentRouters = new express.Router();
const paymentController = require("../../Controllers/Payment/PaymentController");
const { authenticate, authorizeRole } = require("../../Common/Middleware/AuthMiddleware");

// POST /payment/create-order  – create Razorpay order before checkout
paymentRouters.post(
  "/payment/create-order",
  authenticate,
  authorizeRole("User", "Admin"),
  paymentController.createOrder
);

// POST /payment/verify  – verify payment signature and issue ticket
paymentRouters.post(
  "/payment/verify",
  authenticate,
  authorizeRole("User", "Admin"),
  paymentController.verifyPayment
);

module.exports = paymentRouters;
