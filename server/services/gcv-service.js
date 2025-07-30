require("dotenv").config();
const vision = require("@google-cloud/vision");
const { getGCSUri } = require("../utils/image-url.js");

const client = new vision.ImageAnnotatorClient();

const extractTextFromImage = async (relativePath) => {
  try {
    if (!relativePath) {
      throw new Error("Relative path is required to extract text from image");
    }
    const absolutePath = getGCSUri(relativePath);
    if (!absolutePath) {
      throw new Error("Invalid image path");
    }
    const [result] = await client.textDetection(absolutePath);
    const detections = result.textAnnotations || [];
    if (detections.length > 0) {
      const fulltext = detections[0].description;
      return fulltext;
    }
    return "";
  } catch (error) {
    console.error("Error during text detection:", error);
    throw error;
  }
};

module.exports = {
  extractTextFromImage,
};
