"use strict";

const express = require("express");
const {
  createFridge,
  joinFridge,
  getUserFridges,
} = require("../controllers/fridge-controller.js");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.post("/create", authMiddleware, createFridge);
router.post("/join", authMiddleware, joinFridge);
router.get("/current", authMiddleware, getUserFridges);

module.exports = router;
