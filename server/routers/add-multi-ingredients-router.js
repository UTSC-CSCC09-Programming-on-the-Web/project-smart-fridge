"use strict";

const {
  postMultiIngredientsImages,
} = require("../controllers/add-multi-ingredients-controller.js");
const express = require("express");
const fridgeAuthMiddle = require("../middlewares/fridge-author-middleware.js");
const authMiddleware = require("../middlewares/auth-middleware.js");
const getImageUploadMiddleware = require("../middlewares/image-upload-multer.js");

const router = express.Router();

const imageUploadMiddleware = getImageUploadMiddleware({
  folder: "multi-ingredients",
  multiple: true,
  maxCount: 5,
  maxSizeMB: 5,
});
router.post(
  "/:fridge_id/multiIngredients/imagesUpload",
  authMiddleware,
  fridgeAuthMiddle,
  imageUploadMiddleware,
  postMultiIngredientsImages
);

module.exports = router;
