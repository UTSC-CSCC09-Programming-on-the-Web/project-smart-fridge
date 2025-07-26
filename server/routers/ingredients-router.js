"use strict";

const express = require("express");
const {
  getIngredientsInfiniteScroll,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  createMultiIngredients,
} = require("../controllers/ingredients-controller.js");
const fridgeAuthMiddle = require("../middlewares/fridge-author-middleware.js");
const authMiddleware = require("../middlewares/auth-middleware");
const {
  getGCSImageUploadMiddleware,
} = require("../middlewares/image-upload-multer.js");
const uploadToGCSMiddleware = require("../middlewares/gcs-upload-middleware.js");
const tryAcquireFridgeLockMiddleware = require("../middlewares/fridge-lock-middleware.js");

const router = express.Router();

router.get(
  "/:fridge_id/ingredients",
  authMiddleware,
  fridgeAuthMiddle,
  getIngredientsInfiniteScroll
);

const ingredientImageUpload = getGCSImageUploadMiddleware({
  folderName: "ingredients",
});
router.post(
  "/:fridge_id/ingredients",
  authMiddleware,
  fridgeAuthMiddle,
  tryAcquireFridgeLockMiddleware,
  ingredientImageUpload,
  uploadToGCSMiddleware,
  createIngredient
);

const multiIngredientImageUpload = getGCSImageUploadMiddleware({
  folderName: "ingredients",
  any: true,
});
router.post(
  "/:fridge_id/ingredients/multi",
  authMiddleware,
  fridgeAuthMiddle,
  tryAcquireFridgeLockMiddleware,
  multiIngredientImageUpload,
  uploadToGCSMiddleware,
  createMultiIngredients
);

router.put(
  "/:fridge_id/ingredients/:id",
  authMiddleware,
  fridgeAuthMiddle,
  tryAcquireFridgeLockMiddleware,
  updateIngredient
);
router.delete(
  "/:fridge_id/ingredients/:id",
  authMiddleware,
  fridgeAuthMiddle,
  tryAcquireFridgeLockMiddleware,
  deleteIngredient
);

module.exports = router;
