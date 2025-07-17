const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { CvTask, CvTaskImage } = require("../models");
const { pubClient } = require('../redis/redis-socket');
const { CV_JOB_TYPES } = require("../queues/cv-queue");
const { extractTextFromImage } = require('../services/gcv-service');
const {onCvOCRJobCompleted} = require("../services/cv-llm-orches-service.js");

const cvOCRWorker = new Worker("cvQueue", async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { images, traceId } = job.data;
    const cvTask = await CvTask.findOne({
        where: { trace_id: traceId },
    });
    console.log(`CV Task found: ${cvTask ? cvTask.id : 'not found'}`);
    if (!cvTask) {
        throw new Error(`CV Task not found for job ${job.id} with traceId ${traceId}`);
    }
    if (cvTask.status !== 'pending') {
        throw new Error(`CV Task ${cvTask.id} is not in pending state`);
    }
    cvTask.status = 'processing';
    await cvTask.save();


    if (job.name === CV_JOB_TYPES.MultiReceiptsOCR) {
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

        }
        // check done count and then emit event to notify clients
       cvTask.status = 'done';
       await cvTask.save();
        pubClient.publish("cvTaskProgress", JSON.stringify({
            userId: cvTask.user_id,
            message: "Done: All " + cvTask.done_images_count + "/total " + cvTask.images_count + " images processed done for task " + cvTask.id,
        }));
    }
    }, {
    connection: redisBullmq,
    autorun: true,
    removeOnFail: true,
    maxRetries: 3,  
});

cvOCRWorker.on("completed", async(job, returnvalue) => {
    console.log(`cv OCR Job ${job.id} completed successfully`);
    const traceId = job.data.traceId;
    const userId = job.data?.user_id;
    if (!userId) {
        console.error("No userId found in job data:", job.data);
        return;
    }
    console.log(`Publishing cvTaskFinished to user:${userId}`);
    pubClient.publish("cvTaskFinished", JSON.stringify({
        type: 'cvTaskFinished',
        traceId: traceId,
        userId: userId,
    }));
    const { llmTaskRecord } = await onCvOCRJobCompleted(traceId);
    console.log(`LLM Job created successfully for traceId ${traceId}`);
    pubClient.publish("llmOCRExtractTaskCreated", JSON.stringify({
        type: 'llmOCRExtractTaskCreated',
        llmTaskId: llmTaskRecord.id,
        userId: userId,
        traceId: traceId,
        message: "LLM Task created successfully for CV Task with traceId: " + traceId,
    }));
});

module.exports = cvOCRWorker;

