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

router.get("/", getIngredientsInfiniteScroll);

const ingredientImageUpload = getImageUploadMiddleware({ folder: 'ingredients' });
router.post("/", ingredientImageUpload, createIngredient);

router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

module.exports = router;
