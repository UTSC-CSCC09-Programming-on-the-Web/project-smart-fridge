"use strict";

const express = require("express");
const { Model } = require("sequelize");
const {
  createFridge,
  joinFridge,
  getUserFridges,
} = require("../controllers/fridge-controller.js");

const router = express.Router();

router.post("/create", createFridge);
router.post("/join", joinFridge);
router.get("/current", getUserFridges);

model.exports = router;
