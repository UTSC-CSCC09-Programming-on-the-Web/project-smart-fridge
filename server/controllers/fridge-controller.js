"use strict";

const { where } = require("sequelize");

const Fridge = require("../models/index.js").Fridge;
const User = require("../models/index.js").User;
const UserFridge = require("../models/index.js").UserFridge;

const createFridge = async (req, res) => {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const userId = user.id;

  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "Name required" });
  }
  try {
    const fridge = await Fridge.create({ name, description });
    if (!fridge) {
      return res
        .status(400)
        .json({ success: false, error: "Failed to create fridge" });
    }
    await fridge.addUser(userId);

    // temporarily set is_first_login to false
    user.is_first_login = false; // Set first login to false
    await user.save(); // Save the user to update the first login status
    res
      .status(201)
      .json({ success: true, message: "Fridge created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const joinFridge = async (req, res) => {
  const user = req.user;
  if (!user || !user.id) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  const userId = user.id;
  const { fridge_id } = req.body;

  try {
    const existingFridges = await UserFridge.findAll({
      where: {
        user_id: userId,
        fridge_id: fridge_id,
      },
    });
    if (existingFridges.length > 0) {
      console.log(`User ${userId} already in this fridge`);
      return res
        .status(400)
        .json({ success: false, error: "User already in this fridge" });
    }
    const fridge = await Fridge.findByPk(fridge_id);
    if (!fridge) {
      return res
        .status(404)
        .json({ success: false, message: "Fridge not found" });
    }
    await fridge.addUser(userId);
    // temporarily set is_first_login to false
    user.is_first_login = false; // Set first login to false
    await user.save(); // Save the user to update the first login status
    res
      .status(200)
      .json({ success: true, message: "Joined fridge successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUserFridges = async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const fridges = await user.getFridges({
      include: [
        {
          model: User,
          as: "users",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });
    if (!fridges || fridges.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No fridges found for this user" });
    }
    res.status(200).json({ success: true, fridges });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createFridge,
  joinFridge,
  getUserFridges,
};
