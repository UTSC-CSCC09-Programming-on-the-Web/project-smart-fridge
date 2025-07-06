"use strict";

const express = require("express");
const {
  getIngredientsInfiniteScroll,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require("../controllers/ingredients-controller.js");
const getImageUploadMiddleware = require("../middlewares/image-upload-multer.js");

const router = express.Router();

router.get("/:fridge_id/ingredients", getIngredientsInfiniteScroll);

const ingredientImageUpload = getImageUploadMiddleware({
  folder: "ingredients",
});
router.post("/:fridge_id/ingredients", ingredientImageUpload, createIngredient);

router.put("/:fridge_id/ingredients/:id", updateIngredient);
router.delete("/:fridge_id/ingredients/:id", deleteIngredient);

module.exports = router;
