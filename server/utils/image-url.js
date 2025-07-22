require("dotenv").config();

const getImageUrl = (relativePath) => {
  if (!relativePath) {
    return null;
  }
  const base = process.env.BASE_IMAGE_URL || "http://localhost:3000/uploads";
  return `${base}/${relativePath}`;
};

const getGCSUri = (relativePath) => {
  if (!relativePath) {
    return null;
  }
  const bucketName = process.env.GCS_BUCKET_NAME || "smart-fridge-uploads";
  return `gs://${bucketName}/${relativePath}`;
};

module.exports = { getImageUrl, getGCSUri };