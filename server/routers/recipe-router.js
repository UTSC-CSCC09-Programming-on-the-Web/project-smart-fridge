"use strict";

const express = require("express");
const { postGenerateRecipe } = require("../controllers/recipe-controller.js");
const authMiddleware = require("../middlewares/auth-middleware.js");
const fridgeAuthMiddleware = require("../middlewares/fridge-author-middleware.js");

const router = express.Router();

router.post("/generate", authMiddleware, fridgeAuthMiddleware, postGenerateRecipe);

module.exports = router;