"use strict";
const { bucket } = require("../config/gcs-storage.js");
require("dotenv").config();
const path = require("path");

const fileNameFormatter = (file) => {
  const ext = path.extname(file.originalname);
  const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${unique}${ext}`;
};

const uploadSingleToGCS = async (folderName, file) => {
  console.log("uploadSingleToGCS: check file:", file);
  console.log("uploadSingleToGCS: check folder:", folderName);
  const uniqueFileName = fileNameFormatter(file);
  const fileUrl = `${folderName}/${uniqueFileName}`
  const blob = bucket.file(fileUrl);
  const blobStream = blob.createWriteStream({
    resumable: false, 
    metadata: {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000',
    },
  });
  return new Promise((resolve, reject) => {
    console.log("bundle finish event...")
    blobStream.on("finish", () => {
        console.log("upload single to gcs finished back with fileurl:", fileUrl);
      resolve(fileUrl);
    });
    blobStream.on("error", (err) => {
      console.error("Error uploading file to GCS:", err);
      reject(err);
    });
    blobStream.end(file.buffer);
    console.log("end: check buffer size:", file.buffer?.length);
  });
};

const uploadToGCSMiddleware = async (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length == 0) {
        console.log("No file upload");
        return next();
    }
    console.log("[uploadToGCSMiddleware] check files:", files);
    try {
        const uploadResults = await Promise.all(files.map(
            file => uploadSingleToGCS(req.uploadFolderName, file)
        ));
        req.uploadFileResults = uploadResults;
        return next();
    }catch(err){
        if(err){
            console.error("Error uploading files to GCS:", err);
        }
         return res.status(400).json({error: err.message});
    }
}

module.exports = uploadToGCSMiddleware; 