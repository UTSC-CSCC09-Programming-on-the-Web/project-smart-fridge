"use strict";
const UserFridge = require("../models/index.js").UserFridge;
const User = require("../models/index.js").User;

const fridgeAuthMiddle = async (req, res, next) => {
  const fridgeId =
    req.params.fridge_id || req.body.fridgeId || req.query.fridgeId;
  const user = req.user;
  console.log("fridgeId:", fridgeId);
  console.log("user:", user);

  if (!user || !user.id) {
    console.error("Unauthorized access attempt to fridge:", fridgeId);
    return res.status(401).json({ success: false, error: "Unauthorized user" });
  }
  const userId = user.id;
  if (!fridgeId) {
    return res.status(400).json({ error: "Invalid fridge ID" });
  }

  try {
    const record = await UserFridge.findOne({
      where: {
        user_id: userId,
        fridge_id: fridgeId,
      },
    });
    if (!record) {
      return res
        .status(403)
        .json({ error: "Forbidden: You do not have access to this fridge" });
    }
    console.log(`User ${userId} has access to fridge ${fridgeId}`);
    req.fridgeId = fridgeId;
    next();
  } catch (error) {
    console.error("Error checking fridge access:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = fridgeAuthMiddle;
