"use strict";
const {uploadSingleToGCS} = require("../services/gcs-storage-service.js");

const uploadToGCSMiddleware = async (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files || files.length == 0) {
        console.log("No file upload");
        return next();
    }
    console.log("[uploadToGCSMiddleware] check files:", files);
    try {
        const uploadResults = await Promise.all(files.map(
            async(file) => {
                const relativePath = await uploadSingleToGCS(req.uploadFolderName, file);
                file.relativePath = relativePath;
            }
        ));
        return next();
    }catch(err){
        if(err){
            console.error("Error uploading files to GCS:", err);
        }
         return res.status(400).json({error: err.message});
    }
}

module.exports = uploadToGCSMiddleware; 