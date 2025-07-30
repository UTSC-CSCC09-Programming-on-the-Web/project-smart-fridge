"use strict";
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { fileNameFormatter } = require("../utils/file-formatter.js");

// create storage configuration for multer
function createStorage(folder) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const targetPath = path.join(__dirname, `../uploads/${folder}`);
      // if the target path does not exist, create it
      // for future, we move the images under each fridge's own uploads folder
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      cb(null, targetPath);
    },
    filename: function (req, file, cb) {
      cb(null, fileNameFormatter(file));
    },
  });
}

function getDiskImageUploadMiddleware({
  folder,
  multiple = false,
  maxCount = 5,
  maxSizeMB = 5,
}) {
  const storage = createStorage(folder);
  const upload = multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Unsupported image type"), false);
      }
    },
  });
  if (multiple) {
    return upload.array("images", maxCount);
  } else {
    return upload.single("image");
  }
}

function getGCSImageUploadMiddleware({
  folderName,
  multiple = false,
  maxCount = 5,
  maxSizeMB = 5,
  any = false, // if true, use multer.any() to handle multiple files
}) {
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Unsupported image type"), false);
      }
    },
  });

  let handler;
  if (any) {
    handler = upload.any();
  } else if (multiple) {
    handler = upload.array("images", maxCount);
  } else {
    handler = upload.single("image");
  }

  return (req, res, next) => {
    handler(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message });
      }
      req.uploadFolderName = folderName;
      next();
    });
  };
}

module.exports = {
  getDiskImageUploadMiddleware,
  getGCSImageUploadMiddleware,
};
