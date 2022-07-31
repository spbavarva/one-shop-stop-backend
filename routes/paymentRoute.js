const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const router = express.Router();
const {
  processPayment,
  sendStripeApiKey
} = require("../controllers/paymentController");

router.route("/payment/process").post(isAuthenticatedUser, processPayment);

router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);

module.exports = router;
