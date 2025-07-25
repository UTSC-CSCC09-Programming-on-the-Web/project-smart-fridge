// File: server/confjg/passport.js
"use strict";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, Fridge } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const [user] = await User.findOrCreate({
          where: { google_id: profile.id },
          defaults: {
            email: profile.emails[0].value,
            name: profile.displayName,
            is_first_login: true,
            stripe_customer_id: null,
          },
        });
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findByPk(id, {
    include: [
      {
        model: Fridge,
        as: "fridges",
        attributes: ["id", "name"],
        through: { attributes: [] }, // Exclude UserFridge attributes
        required: false,
      },
    ],
  });
  done(null, user);
});
