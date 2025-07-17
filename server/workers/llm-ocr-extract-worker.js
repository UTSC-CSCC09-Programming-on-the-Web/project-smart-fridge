const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { LlmTask } = require("../models");
const { pubClient } = require('../redis/redis-socket');
const { LLM_JOB_TYPES } = require("../queues/llm-queue");
const { callGpt } = require("../services/gpt/gpt-service");


const llmOCRExtractWorker = new Worker("llmQueue", async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { fullText, traceId} = job.data;
    
     await LlmTask.update({ status: 'processing'}, 
            { where: { trace_id: traceId} });
    
    if (job.name === LLM_JOB_TYPES.OCRextract) {
        console.log("Processing OCR extraction with data:", job.data);
  
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await callGpt({
            taskType: "ocr_format",
            data: { fullText: fullText },
        });

        console.log("Extracted ingredients from OCR:", result);
        await LlmTask.update({ status: 'done', result: result }, 
            { where: {  trace_id: traceId} });

        return result;
    }
    }, {
    connection: redisBullmq,
    autorun: true,
    removeOnFail: true,
    maxRetries: 3,  
});

llmOCRExtractWorker.on("completed", async(job, returnvalue) => {
    console.log(`Job ${job.id} completed successfully`);
    const traceId = job.data.traceId;
    const userId = job.data?.user_id;
    if (!userId) {
        console.error("No userId found in job data:", job.data);
        return;
    }
}); 

module.exports = llmOCRExtractWorker;

