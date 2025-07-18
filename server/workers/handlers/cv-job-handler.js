'use strict';
const { CvTask, CvTaskImage } = require("../../models/index.js");
const { pubClient } = require('../../redis/redis-socket.js');
const { extractTextFromImage } = require('../../services/gcv-service.js');

async function handleMultiReceiptsOCR(images, cvTask){
    for (const image of images) {
        const cvTaskImage = await CvTaskImage.findOne({
            where: { id: image.id, cv_task_id: cvTask.id }
        });
        if (!cvTaskImage) {
            console.log(`Image with ID ${image.id} not found in CV Task ${cvTask.id}`);
            continue;
        }
        cvTaskImage.status = 'processing';
        await cvTaskImage.save();
        console.log(`Processing image ${image.original_filename} for CV Task ${cvTask.id} with image url ${image.image_url}`);
        
        const ocrResult = await extractTextFromImage(image.image_url);

        console.log(`OCR result for image ${image.original_filename}:`, ocrResult);

        cvTaskImage.status = 'done';
        cvTaskImage.result = {
            text: ocrResult,
        };
        await cvTaskImage.save();
        console.log(`cvTaskImage ${cvTaskImage.original_filename} result is: ${cvTaskImage.result.text}`);

        // update the cvTask done_images_count
        const images_done = cvTask.done_images_count += 1;
        await cvTask.save();
        
    
        pubClient.publish("cvTaskProgress", JSON.stringify({
            userId: cvTask.user_id,
            message: "Image processed done for " + image.original_filename + ", total done images: " + images_done + "/" + cvTask.images_count,
        }));
        console.log(`Image ${image.original_filename} processed successfully`);
         await new Promise((resolve) => setTimeout(resolve, 1000));
    }
     pubClient.publish("cvTaskProgress", JSON.stringify({
            userId: cvTask.user_id,
            message: "Done: All " + cvTask.done_images_count + "/total " + cvTask.images_count + " images processed done for text detection task ",
        }));

     await new Promise((resolve) => setTimeout(resolve, 500));
}

module.exports = {
    handleMultiReceiptsOCR,
};