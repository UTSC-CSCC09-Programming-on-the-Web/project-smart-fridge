"use strict";

const express = require("express");
const {
  getIngredientsInfiniteScroll,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../controllers/ingredients-controller.js");
const getImageUploadMiddleware = require("../middlewares/image-upload-multer.js");
const fridgeAuthMiddle = require("../middlewares/fridge-author-middleware.js");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

router.get("/:fridge_id/ingredients", authMiddleware, fridgeAuthMiddle, getIngredientsInfiniteScroll);

const ingredientImageUpload = getImageUploadMiddleware({
  folder: "ingredients",
});
router.post("/:fridge_id/ingredients", authMiddleware, fridgeAuthMiddle, ingredientImageUpload, createIngredient);

router.put("/:fridge_id/ingredients/:id", authMiddleware, fridgeAuthMiddle, updateIngredient);
router.delete("/:fridge_id/ingredients/:id", authMiddleware, fridgeAuthMiddle, deleteIngredient);

module.exports = router;
