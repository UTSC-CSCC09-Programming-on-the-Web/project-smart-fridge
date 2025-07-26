"use strict";

const {
  postMultiIngredientsImages,
} = require("../controllers/add-multi-ingredients-controller.js");
const express = require("express");
const fridgeAuthMiddle = require("../middlewares/fridge-author-middleware.js");
const authMiddleware = require("../middlewares/auth-middleware.js");
const {
  getGCSImageUploadMiddleware,
} = require("../middlewares/image-upload-multer.js");
const uploadToGCSMiddleware = require("../middlewares/gcs-upload-middleware.js");

const router = express.Router();

const imageUploadMiddleware = getGCSImageUploadMiddleware({
  folderName: "multi-ingredients",
  multiple: true,
  maxCount: 5,
  maxSizeMB: 5,
});
router.post(
  "/:fridge_id/multiIngredients/imagesUpload",
  authMiddleware,
  fridgeAuthMiddle,
  imageUploadMiddleware,
  uploadToGCSMiddleware,
  postMultiIngredientsImages
);

module.exports = router;
