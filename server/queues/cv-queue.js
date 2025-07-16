const { Queue } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const CvTask = require("../models/");
const CvTaskImage = require("../models/cv-task-image.js");
const { randomUUID } = require("crypto");

const cvQueue = new Queue("cvQueue", {
  connection: redisBullmq,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
}); 

const CV_JOB_TYPES = {
  MultiReceiptsOCR: "multi_receipts_ocr",
};

const addCvJob = async (jobType, jobData, options = {}) => {
    if (!Object.values(CV_JOB_TYPES).includes(jobType)) {
        throw new Error(`Invalid job type: ${jobType}`);
    }
    
    const traceId = randomUUID();
    const fullJobData = {
        ...jobData,
        traceId,
        createdAt: new Date().toISOString(),
   };
    
    const job = await cvQueue.add(jobType, fullJobData, options);
    const cvTaskRecord = await CvTask.create({
        task_id: job.id,
        job_type: jobType,
        fridge_id: jobData.fridge_id || null,
        user_id: jobData.user_id || null,
        status: 'pending',
        trace_id: traceId,
        images_count: 0,
        done_images_count: 0,
        failed_images_count: 0,
    });

    if (jobData.images && jobData.images.length > 0) {
        const cvTaskImages = jobData.images.map(image => ({
            cv_task_id: cvTaskRecord.id,
            original_filename: image.original_filename, 
            image_url: image.image_url, 
            status: 'pending',
        }));
        
        await CvTaskImage.bulkCreate(cvTaskImages);
        cvTaskRecord.images_count = cvTaskImages.length;
        await cvTaskRecord.save();
    }


    console.log(`Added job ${job.id} of type ${jobType} to the cv queue`);
    return { job, cvTaskRecord };
};

module.exports = { cvQueue, addCvJob, CV_JOB_TYPES };