const { Storage } = require("@google-cloud/storage");
const path = require("path");
require("dotenv").config();

const bucketName = process.env.GCS_BUCKET_NAME || "smart-fridge-uploads";
const googleCredentialPath = path.join(
  __dirname,
  "../",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
const storage = new Storage({
  keyFilename: googleCredentialPath,
  projectId: process.env.GOOGLE_PROJECT_ID,
});
const bucket = storage.bucket(bucketName);
module.exports = {
  storage,
  bucket,
};
