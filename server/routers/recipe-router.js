"use strict";

const express = require("express");
const { postGenerateRecipe, getRecipeResult } = require("../controllers/recipe-controller.js");
const authMiddleware = require("../middlewares/auth-middleware.js");
const fridgeAuthMiddleware = require("../middlewares/fridge-author-middleware.js");

const router = express.Router();

router.post("/generate", authMiddleware, fridgeAuthMiddleware, postGenerateRecipe);

// GET /api/recipes/result/:traceId
router.get("/result/:traceId", authMiddleware, getRecipeResult);

module.exports = router;