const { Queue } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { CvTask, CvTaskImage } = require("../models");
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

const addCvJob = async (
  jobType,
  jobData,
  inputTraceId = null,
  options = {}
) => {
  if (!Object.values(CV_JOB_TYPES).includes(jobType)) {
    throw new Error(`Invalid job type: ${jobType}`);
  }
  const traceId = inputTraceId || randomUUID();
  let cvTaskImages = [];
  if (jobData.images && jobData.images.length > 0) {
    const rawImages = [...jobData.images];
    cvTaskImages = rawImages.map((image) => ({
      id: randomUUID(),
      original_filename: image.original_filename,
      image_url: image.image_url,
      status: "pending",
    }));
    jobData.images = cvTaskImages.map((image) => ({
      id: image.id,
      original_filename: image.original_filename,
      image_url: image.image_url,
    }));
  }

  const fullJobData = {
    ...jobData,
    traceId,
    createdAt: new Date().toISOString(),
  };
  const cvTaskRecord = await CvTask.create({
    job_type: jobType,
    fridge_id: jobData.fridge_id || null,
    user_id: jobData.user_id || null,
    status: "pending",
    trace_id: traceId,
    images_count: cvTaskImages.length,
    done_images_count: 0,
    failed_images_count: 0,
  });

  if (cvTaskImages && cvTaskImages.length > 0) {
    cvTaskImages = cvTaskImages.map((image) => ({
      ...image,
      cv_task_id: cvTaskRecord.id,
    }));

    await CvTaskImage.bulkCreate(cvTaskImages);
  }
  const job = await cvQueue.add(jobType, fullJobData, options);
  cvTaskRecord.task_id = job.id;
  await cvTaskRecord.save();
  return { job, cvTaskRecord };
};

module.exports = { cvQueue, addCvJob, CV_JOB_TYPES };
