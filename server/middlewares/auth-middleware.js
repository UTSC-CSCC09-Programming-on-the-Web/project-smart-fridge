"use strict";

const authMiddleware = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized: user not logged in" });
  }

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  next();
};

module.exports = authMiddleware;
