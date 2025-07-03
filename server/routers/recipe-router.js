"use strict";

const express = require("express");
const { postGenerateRecipe } = require("../controllers/recipe-controller.js");

const router = express.Router();

router.post("/generate", postGenerateRecipe);

module.exports = router;