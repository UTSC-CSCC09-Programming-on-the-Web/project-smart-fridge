// services/stripe-service.js
"use strict";

const dotenv = require("dotenv");
dotenv.config();
const { User } = require("../models");

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (user) => {
  if (!user.stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });

    user.stripe_customer_id = customer.id;

    await User.update(
      { stripe_customer_id: customer.id },
      { where: { id: user.id } }
    );
  }

  return await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: user.stripe_customer_id,
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/main?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/subscribe`,
    metadata: {
      user_id: user.id,
    },
  });
};

module.exports = {
  createCheckoutSession,
};