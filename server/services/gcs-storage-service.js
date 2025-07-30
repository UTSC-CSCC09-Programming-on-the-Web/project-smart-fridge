"use strict";
const { bucket } = require("../config/gcs-storage.js");
const { fileNameFormatter } = require("../utils/file-formatter.js");

const deleteFileFromGCS = async (fileUrl) => {
  const blob = bucket.file(fileUrl);
  try {
    await blob.delete();
  } catch (err) {
    console.warn(`Error deleting file ${fileUrl} from GCS:`, error);
    throw new Error(`Failed to delete file from GCS: ${error.message}`);
  }
};

const uploadSingleToGCS = async (folderName, file) => {
  const uniqueFileName = fileNameFormatter(file);
  const fileUrl = `${folderName}/${uniqueFileName}`;
  const blob = bucket.file(fileUrl);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
      cacheControl: "public, max-age=31536000",
    },
  });
  return new Promise((resolve, reject) => {
    blobStream.on("finish", () => {
      resolve(fileUrl);
    });
    blobStream.on("error", (err) => {
      console.error("Error uploading file to GCS:", err);
      reject(err);
    });
    blobStream.end(file.buffer);
  });
};

module.exports = { deleteFileFromGCS, uploadSingleToGCS };
