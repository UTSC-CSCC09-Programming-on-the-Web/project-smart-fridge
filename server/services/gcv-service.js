require('dotenv').config();
const vision = require('@google-cloud/vision');
const path = require('path');
const fs = require('fs');

const client = new vision.ImageAnnotatorClient();

const extractTextFromImage = async (relativePath) => {
    try {
        if (!relativePath) {
            throw new Error('Relative path is required to extract text from image');
        }
        const absolutePath = path.resolve(__dirname, '../uploads/', relativePath);
        console.log(`Extracting text from image at path: ${absolutePath}`);
        if (!absolutePath || !fs.existsSync(absolutePath)) {
            throw new Error('Invalid image path');
        }
        const [result] = await client.textDetection(absolutePath);
        const detections = result.textAnnotations || [];
        if (detections.length > 0){
            const fulltext = detections[0].description;
            console.log(`Extracted text from image ${relativePath}:`, fulltext);
            return fulltext;
        }
        console.log(`No text detected in image ${relativePath}`);
        return '';
    } catch (error) {
        console.error('Error during text detection:', error);
        throw error;
    }
}

module.exports = {
    extractTextFromImage,
};