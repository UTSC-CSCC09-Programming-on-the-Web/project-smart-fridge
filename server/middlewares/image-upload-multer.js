// File: server/middlewares/image-upload-multer.js
"use strict";
const multer = require('multer');
const path = require('path');


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
      const ext = path.extname(file.originalname);
      const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${unique}${ext}`);
    }
  });
}

function getImageUploadMiddleware({ folder, multiple = false, maxCount = 5, maxSizeMB = 5 }) {
  const storage = createStorage(folder);
  const upload = multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']; 
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Unsupported image type'), false);
      }
    }
  });

  if (multiple) {
    return upload.array('image', maxCount); 
  } else {
    return upload.single('image');
  }
}

module.exports = { getImageUploadMiddleware };

