"use strict";
require("dotenv").config();

const handleGoogleSuccess = (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.CLIENT_URL}/auth/google/failure?error=session_lost`);
  }
  console.log("Google authentication successful");
  res.redirect(`${process.env.CLIENT_URL}/auth/google/success`);
};

const handleGoogleFailure = (req, res) => {
  console.error("Google authentication failed");
  res.redirect(
    `${process.env.CLIENT_URL}/auth/google/failure?error=${encodeURIComponent(
      "Google authentication failed"
    )}`
  );
};

const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const { id, name, email, is_subscribe, is_first_login, fridges } = req.user;
  let user_status = "active";
  if (!is_subscribe) {
    user_status = "need_subscription";
  } else if (is_first_login) {
    user_status = "first_login";
  }

  return res.status(200).json({
    success: true,
    user_status,
    user: { id, name, email, is_subscribe, is_first_login, fridges },
  });
};

const handleLogout = (req, res) => {
  console.log("User logging out");
  req.logout(() => {
    res.clearCookie("connect.sid");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });
};

module.exports = {
  handleGoogleSuccess,
  handleGoogleFailure,
  getCurrentUser,
  handleLogout,
};
