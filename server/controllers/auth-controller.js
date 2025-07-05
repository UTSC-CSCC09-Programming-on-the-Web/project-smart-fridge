"use strict";

const handleGoogleSuccess = (req, res) => {
  if (!req.user) {
      return res.redirect('/auth/google/failure?error=session_lost');
    }
  console.log("Google authentication successful", req.user);
  res.redirect(
    `http://localhost:4200/auth/google/success`
  );
};

const handleGoogleFailure = (req, res) => {
  console.error("Google authentication failed", req.query);
  res.redirect(
    `http://localhost:4200/auth/google/failure?error=${encodeURIComponent(
    "Google authentication failed")}`);
};

const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  let user_status = "active";
  if (!req.user.is_subscribe) {
    user_status = "need_subscription";
  } else if (req.user.is_first_login) {
    user_status = "first_login";
  }

  const { id, name, email, is_subscribed, is_first_login } = req.user;

  return res.status(200).json({
    success: true,
    user_status,
    user: { id, name, email, is_subscribed, is_first_login },
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