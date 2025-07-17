const { Worker } = require("bullmq");
const redisBullmq = require("../redis/redis-bullmq");
const { LlmTask } = require("../models");
const { pubClient } = require('../redis/redis-socket');
const { LLM_JOB_TYPES } = require("../queues/llm-queue");
const { callGpt } = require("../services/gpt/gpt-service");


const llmRecipeWorker = new Worker("llmQueue", async (job) => {
    
    console.log(`llm worker: Processing job ${job.id} of type ${job.name}`);
    const { traceId } = job.data;

    await LlmTask.update({ status: 'processing' },
        { where: { trace_id: traceId } });
    // refactor to job handler function later
    if (job.name === LLM_JOB_TYPES.RecipeGenerate) {
        const { ingredients } = job.data;
        console.log("Generating recipe with data:", job.data);
        // Simulate a delay for recipe generation
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const result = await callGpt({
            taskType: "recipe",
            data: { ingredients },
        });
        // Simulate recipe generation
        // const generatedRecipe = {
        // id: job.id,
        // title: "Sample Recipe",
        // ingredients: ingredients,
        // instructions: "Mix ingredients and cook for 20 minutes."
        // };

        console.log("Generated recipe:", result);
        await LlmTask.update({ status: 'done', result: result }, 
            { where: {  trace_id: traceId} });

        // Publish the generated recipe to Redis
        return result;
    }
     if (job.name === LLM_JOB_TYPES.OCRextract) {
        console.log("Processing OCR extraction with data:", job.data);
        const { fullText } = job.data;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await callGpt({
            taskType: "ocr_format",
            data: { fullText: fullText },
            temperature: 0.1,
        });

        console.log("Extracted ingredients from OCR:", result);
        await LlmTask.update({ status: 'done', result: result },
            { where: { trace_id: traceId } });

        return result;
    }
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

