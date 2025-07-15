const { Worker } = require("bullmq");
const { redisBullmq } = require("../config/redis/redis-bullmq");
const { LlmTask } = require("../models");
const { pubClient } = require('../config/redis/redis-socket');

const { LLM_JOB_TYPES } = require("../queues/llm-queue");


const llmRecipeWorker = new Worker("llmQueue", async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { ingredients, traceId} = job.data;

     await LlmTask.update({ status: 'processing'}, 
            { where: { task_id: job.id, trace_id: traceId} });
    
    if (job.name === LLM_JOB_TYPES.RecipeGenerate) {
        console.log("Generating recipe with data:", job.data);
        
        // Simulate recipe generation
        const generatedRecipe = {
        id: job.id,
        title: "Sample Recipe",
        ingredients: ingredients,
        instructions: "Mix ingredients and cook for 20 minutes."
        };
    
        console.log("Generated recipe:", generatedRecipe);
        await LlmTask.update({ status: 'done', result: generatedRecipe }, 
            { where: { task_id: job.id, trace_id: traceId} });

        // Publish the generated recipe to Redis
        
        return generatedRecipe;
    }
    }, {
    connection: redisBullmq,
    autorun: true,
    removeOnComplete: true,
    removeOnFail: true,
});

llmRecipeWorker.on("completed", (job, returnvalue) => {
    console.log(`Job ${job.id} completed successfully`);
    const traceId = job.data.traceId;
    // later move publish the traceid to Redis right here  
}); 

module.exports = llmRecipeWorker;

