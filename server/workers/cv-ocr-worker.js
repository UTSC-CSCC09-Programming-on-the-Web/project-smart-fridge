const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { CvTask, CvTaskImage } = require("../models");
const { pubClient } = require('../redis/redis-socket');
const { CV_JOB_TYPES } = require("../queues/cv-queue");


const cvOCRWorker = new Worker("cvQueue", async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { images, traceId } = job.data;
    const cvTask = await CvTask.findOne({
        where: { task_id: job.id, trace_id: traceId },
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
            console.log(`Processing image ${image.original_filename} for CV Task ${cvTask.id}`);
           
            // Simulate OCR processing
            await new Promise((resolve) => setTimeout(resolve, 3000));

            cvTaskImage.status = 'done';
            cvTaskImage.result = {
                job_type: job.name,
                image_name: image.original_filename,
                text: 'OCR result', // Simulated OCR result
                id: image.id,
                cv_trace_id: traceId,
                cv_task_id: cvTask.id,
            };
            await cvTaskImage.save();
          
            // update the cvTask done_images_count
            const images_done = cvTask.done_images_count += 1;
            await cvTask.save();
           
     
            pubClient.publish("cvTaskUpdated", JSON.stringify({
                userId: cvTask.user_id,
                message: "Image processed done for " + image.original_filename + ", total done images: " + images_done + "/" + cvTask.total_images_count,
            }));
            console.log(`Image ${image.original_filename} processed successfully`);

        }
        // check done count and then emit event to notify clients
       cvTask.status = 'done';
       await cvTask.save();
        pubClient.publish("cvTaskUpdated", JSON.stringify({
            userId: cvTask.user_id,
            message: "All " + cvTask.done_images_count + "/total " + cvTask.total_images_count + " images processed done for task " + cvTask.id,
        }));
    }
    }, {
    connection: redisBullmq,
    autorun: true,
    removeOnFail: true,
    maxRetries: 3,  
});

cvOCRWorker.on("completed", async(job, returnvalue) => {
    console.log(`Job ${job.id} completed successfully`);
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
}); 

module.exports = cvOCRWorker;

