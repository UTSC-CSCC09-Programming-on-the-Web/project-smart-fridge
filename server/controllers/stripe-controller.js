"use strict";

const express = require("express");
const { createCheckoutSession } = require("../services/stripe-service");
const dotenv = require("dotenv");
dotenv.config();
const { User } = require("../models");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleNewCheckoutSession = async (req, res) => {
  const user = req.user; // Assuming user is set by auth middleware

  if (!user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  try {
    const session = await createCheckoutSession(user);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const payload = req.body;

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error("Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;
  const type = event.type;

  try {
    switch (type) {
      case "customer.subscription.created":
        await User.update(
          {
            subscription_status: data.status, // usually "active"
          },
          {
            where: { stripe_customer_id: data.customer },
          }
        );
        console.log("Subscription created:", data.id);
        break;

      case "customer.subscription.updated":
        await User.update(
          {
            subscription_status: data.status,
          },
          {
            where: { stripe_customer_id: data.customer },
          }
        );
        console.log("Subscription updated:", data.id);
        break;

      case "customer.subscription.deleted":
        await User.update(
          {
            subscription_status: "canceled",
          },
          {
            where: { stripe_customer_id: data.customer },
          }
        );
        console.log("Subscription canceled:", data.id);
        break;
      case "checkout.session.completed":
        const session = data;
        if (session.mode === "subscription" && session.metadata?.user_id) {
          const userId = session.metadata.user_id;
          const user = await User.findByPk(userId);
          if (user) {
            console.log(`Updating subscription for user `, user);
            user.set("subscription_status", "active");
            user.set("stripe_subscription_id", session.subscription);
            await user.save();
            console.log(`User ${userId} subscription updated to active.`);
          } else {
            console.error(`User with ID ${userId} not found.`);
          }
        }
        console.log("Checkout session completed:", session.id);
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  handleNewCheckoutSession,
  handleStripeWebhook,
};
