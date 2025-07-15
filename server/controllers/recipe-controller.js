"use strict";

const { getIngredientsForRecipe } = require("../services/ingredient-service.js");
const {llmQueue, addLlmJob, LLM_JOB_TYPES} = require("../queues/llm-queue.js");
const { LlmTask, UserFridge } = require("../models");
 

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

const getRecipeResult = async (req, res) => {
  const traceId = req.params?.traceId;
  try {
    const llmTask = await LlmTask.findOne({ where: { trace_id: traceId } });
    if (!llmTask) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    const userId = req.user?.id;
    if (llmTask.user_id && llmTask.user_id !== userId) {
      console.error(`Unauthorized access attempt by user ${userId} for recipe with traceId ${traceId}`);
      return res.status(403).json({ error: 'Unauthorized access to this recipe' });
    }
    const fridges = await UserFridge.findAll({ where: { user_id: userId, fridge_id: llmTask.fridge_id } });
   //  console.log(`Fridges for user ${userId}:`, fridges);
    if (llmTask.fridge_id && fridges.length == 0) {
      console.error(`Unauthorized access attempt by user ${userId} for fridge with id ${llmTask.fridge_id}`);
      return res.status(403).json({ error: 'Unauthorized access to this fridge' });
    }
    if (llmTask.status === 'done') {
      return res.status(200).json(llmTask.result);
    } else if (llmTask.status === 'failed') {
      return res.status(500).json({ message: 'Recipe generation failed' });
    }else{
      return res.status(202).json({ message: 'Recipe generation in progress' });
    }
  } catch (error) {
    console.error('Error fetching recipe result:', error);
    res.status(500).json({ error: 'Failed to fetch recipe result' });
  }
};

module.exports = {
  postGenerateRecipe,
  getRecipeResult,
};