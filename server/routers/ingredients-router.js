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

const router = express.Router();

router.get("/:fridge_id/ingredients", fridgeAuthMiddle, getIngredientsInfiniteScroll);

const ingredientImageUpload = getImageUploadMiddleware({
  folder: "ingredients",
});
router.post("/:fridge_id/ingredients", fridgeAuthMiddle, ingredientImageUpload, createIngredient);

router.put("/:fridge_id/ingredients/:id", fridgeAuthMiddle, updateIngredient);
router.delete("/:fridge_id/ingredients/:id", fridgeAuthMiddle, deleteIngredient);

module.exports = router;
