const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { CvTask, CvTaskImage } = require("../models");
const { pubClient } = require('../redis/redis-socket');
const { CV_JOB_TYPES } = require("../queuescv-queue");


const cvOCRWorker = new Worker("cvQueue", async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const traceId = job.data.traceId;
    const images = job.data.images || [];

    const cvTask = await CvTask.findOne({
        where: { task_id: job.id, trace_id: traceId },
    });
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
            await CvTaskImage.update({ status: 'processing' }, { where: { id: image.id } });
            if (image.cv_task_id !== cvTask.id) {
                throw new Error(`Image ${image.id} does not belong to task ${cvTask.id}`);
            }
            // Simulate OCR processing
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await CvTaskImage.update({ status: 'done', 
                result: { job_type: job.name, 
                    image_name: image.original_filename, 
                    text: 'OCR result', 
                    id: image.id, 
                    task_id: cvTask.id } }, 
                    { where: { id: image.id } });
                    
            // update the cvTask done_images_count
            cvTask.done_images_count += 1;
            await cvTask.save();
           
            // publish event to notify clients

            // emit event to notify clients for each image processed

        }
        // check done count and then emit event to notify clients
       cvTask.status = 'done';
        await cvTask.save();
    
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
}); 

module.exports = cvOCRWorker;

