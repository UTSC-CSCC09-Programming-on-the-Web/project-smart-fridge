"use strict";

const { getIngredientsForRecipe } = require("../services/ingredient-service.js");
const {llmQueue, addLlmJob, LLM_JOB_TYPES} = require("../queues/llm-queue.js");

// POST /api/recipes/generate
const postGenerateRecipe = async (req, res) => {
  console.log('Generating recipe in controller...');
  try{
    const fridgeId = req.fridgeId || req.body.fridgeId; // for single fridge right now
    const ingredients = await getIngredientsForRecipe(fridgeId);
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'No ingredients available for recipe generation' });
    }
    const jobType = LLM_JOB_TYPES.RecipeGenerate;
    const jobData = {
      ingredients: ingredients.map(ingredient => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        expire_date: ingredient.expire_date,
      })),
      fridge_id: fridgeId,
      user_id: req.user?.id, 
    };
    const { job, llmTaskRecord } = await addLlmJob(jobType, jobData);
    console.log(`Job ${job.id} added to the queue for recipe generation`);
    console.log(`LlmTask record created with ID: ${llmTaskRecord.id}`);
    res.status(202).json({
      ingredients: ingredients.map(ingredient => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        expire_date: ingredient.expire_date,
      })),
      recipe:  "Accepted! Generating recipe..."});  
  } catch (error) {
      console.error('Error generating recipe:', error);
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
}

module.exports = {
  postGenerateRecipe,
};