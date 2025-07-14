"use strict";

const { getIngredientsForRecipe } = require("../services/ingredient-service.js");

// POST /api/recipes/generate
const postGenerateRecipe = async (req, res) => {
  console.log('Generating recipe in controller...');
  try{
    const fridgeId = req.fridgeId || req.body.fridgeId; // for single fridge right now
    const ingredients = await getIngredientsForRecipe(fridgeId);
    res.status(200).json({
      ingredients: ingredients.map(ingredient => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        expire_date: ingredient.expire_date,
      })),
      recipe:  "Sample Recipe back from controller"});  
  } catch (error) {
      console.error('Error generating recipe:', error);
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
}

module.exports = {
  postGenerateRecipe,
};