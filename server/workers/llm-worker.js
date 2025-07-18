const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { LlmTask } = require("../models");
const { pubClient } = require('../redis/redis-socket');
const { LLM_JOB_TYPES } = require("../queues/llm-queue");
const {handleRecipeGeneration, handleOCRExtraction} = require("./handlers/llm-job-handler.js");

const llmRecipeWorker = new Worker("llmQueue", async (job) => {
    
    console.log(`llm worker: Processing job ${job.id} of type ${job.name}`);
    const { traceId } = job.data;

    await LlmTask.update({ status: 'processing' },
        { where: { trace_id: traceId } });
    // refactor to job handler function later
    let result;
    if (job.name === LLM_JOB_TYPES.RecipeGenerate) {
        const { ingredients } = job.data;
        console.log("Generating recipe with data:", job.data);
        result = await handleRecipeGeneration(ingredients);
    }
     if (job.name === LLM_JOB_TYPES.OCRextract) {
        console.log("Processing OCR extraction with data:", job.data);
        const { fullText } = job.data;
        result = await handleOCRExtraction(fullText);
        console.log("OCR extraction result:", result);
    }
    if (!result) {
        console.error(`No result returned for job ${job.id} with traceId ${traceId}`);
    }
    console.log(`llm Job ${job.id} completed with result:`, result);
        await LlmTask.update({ status: 'done', result: result },
            { where: { trace_id: traceId } });

        return result;
    }, {
    connection: redisBullmq,
    autorun: true,
    removeOnFail: true,
    maxRetries: 3,  
});

llmRecipeWorker.on("completed", async(job, returnvalue) => {
    console.log(`Job ${job.id} completed successfully`);
    const traceId = job.data.traceId;
    const userId = job.data?.user_id;
    if (!userId) {
        console.error("No userId found in job data:", job.data);
        return;
    }
    if (job.name === LLM_JOB_TYPES.RecipeGenerate) {
     console.log(`Publishing recipeGenerated to user:${userId}`);
      pubClient.publish(`recipeGenerated`, JSON.stringify({
            type: 'recipeGenerated',
            traceId: traceId,
            userId: userId,
        }));
    }
}); 

module.exports = llmRecipeWorker;

