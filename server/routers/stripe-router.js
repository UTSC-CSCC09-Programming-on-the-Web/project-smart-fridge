
"use strict";

const express = require("express");
const router = express.Router();
const {handleStripeWebhook, handleNewCheckoutSession} = require("../controllers/stripe-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const webhookRouter = express.Router(); 

webhookRouter.post("/", 
    express.raw({ type: "application/json" }), handleStripeWebhook);

router.post("/create-checkout-session", 
    authMiddleware, handleNewCheckoutSession);

module.exports = {
  stripeRouter: router,
  stripeWebhookRouter: webhookRouter,
};

