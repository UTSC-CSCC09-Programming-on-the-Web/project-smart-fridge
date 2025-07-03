"use strict";

// POST /api/recipes/generate
const postGenerateRecipe = async (req, res) => {
    console.log('Generating recipe in controller...');
    res.status(200).json({
        recipe:  "Sample Recipe back from controller"});  
}

module.exports = {
  postGenerateRecipe,
};