const { Queue } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const LlmTask = require("../models/index.js").LlmTask;
const { randomUUID } = require("crypto");

const llmQueue = new Queue("llmQueue", {
  connection: redisBullmq,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

const LLM_JOB_TYPES = {
  RecipeGenerate: "recipe_generate",
  OCRextract: "ocr_extract",
};

const addLlmJob = async (
  jobType,
  jobData,
  inputTraceId = null,
  options = {}
) => {
  if (!Object.values(LLM_JOB_TYPES).includes(jobType)) {
    throw new Error(`Invalid job type: ${jobType}`);
  }

  const traceId = inputTraceId || randomUUID();
  const fullJobData = {
    ...jobData,
    traceId,
    createdAt: new Date().toISOString(),
  };
  const llmTaskRecord = await LlmTask.create({
    job_type: jobType,
    fridge_id: jobData.fridge_id || null,
    user_id: jobData.user_id || null,
    status: "pending",
    trace_id: traceId,
  });

  const job = await llmQueue.add(jobType, fullJobData, options);
  llmTaskRecord.task_id = job.id;
  await llmTaskRecord.save();

  console.log(`Added job ${job.id} of type ${jobType} to the queue`);
  return { job, llmTaskRecord };
};

module.exports = { llmQueue, addLlmJob, LLM_JOB_TYPES };
