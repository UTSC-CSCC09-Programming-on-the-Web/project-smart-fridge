"use strict";

const { postMultiIngredientsImages } = require("../controllers/add-multi-ingredients-controller.js");
const express = require("express");
const fridgeAuthMiddle = require("../middlewares/fridge-author-middleware.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

const router = express.Router();

router.post("/:fridge_id/multiIngredients/imagesUpload", authMiddleware, fridgeAuthMiddle, postMultiIngredientsImages);

module.exports = router;