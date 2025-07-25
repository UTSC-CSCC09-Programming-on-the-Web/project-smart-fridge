"use strict";

const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq.js");
const { CvTask, CvTaskImage } = require("../models/index.js");
const { pubClient } = require("../redis/redis-socket.js");
const { CV_JOB_TYPES } = require("../queues/cv-queue.js");
const { onCvOCRJobCompleted } = require("../services/cv-llm-orches-service.js");
const { handleMultiReceiptsOCR } = require("./handlers/cv-job-handler.js");

const cvOCRWorker = new Worker(
  "cvQueue",
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { images, traceId } = job.data;
    const cvTask = await CvTask.findOne({
      where: { trace_id: traceId },
    });
    console.log(`CV Task found: ${cvTask ? cvTask.id : "not found"}`);
    if (!cvTask) {
      throw new Error(
        `CV Task not found for job ${job.id} with traceId ${traceId}`
      );
    }
    if (cvTask.status !== "pending") {
      throw new Error(`CV Task ${cvTask.id} is not in pending state`);
    }
    cvTask.status = "processing";
    await cvTask.save();

    if (job.name === CV_JOB_TYPES.MultiReceiptsOCR) {
      await handleMultiReceiptsOCR(images, cvTask);
    }
    cvTask.status = "done";
    await cvTask.save();
  },
  {
    connection: redisBullmq,
    autorun: true,
    removeOnFail: true,
    maxRetries: 3,
  }
);

cvOCRWorker.on("completed", async (job, returnvalue) => {
  console.log(`cv OCR Job ${job.id} completed successfully`);
  const traceId = job.data.traceId;
  const userId = job.data?.user_id;
  if (!userId) {
    console.error("No userId found in job data:", job.data);
    return;
  }
  pubClient.publish(
    "cvTaskProgress",
    JSON.stringify({
      userId: userId,
      message: `CV Task: OCR text detection completed successfully`,
      type: "success",
    })
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  const { llmTaskRecord } = await onCvOCRJobCompleted(traceId);
  console.log(`LLM Job created successfully for traceId ${traceId}`);
});

cvOCRWorker.on("failed", async (job, err) => {
  console.error(`cv OCR Job ${job.id} failed with error:`, err);
  const traceId = job.data.traceId;
  const userId = job.data?.user_id;
  if (!userId) {
    console.error("No userId found in job data:", job.data);
    return;
  }
   await CvTask.update(
    { status: "failed", error: err.message },
    { where: { trace_id: traceId } }
  );
  pubClient.publish(
    "cvTaskProgress",
    JSON.stringify({
      userId: userId,
      type: "error",
      message: `CV Task: OCR text detection failed with error: ${err.message}`,
    })
  );
});

module.exports = cvOCRWorker;
