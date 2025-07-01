// File: server/controllers/ingredients-controller.js

const { Ingredient } = require("../models/index.js");
const validateIngredient = require("../utils/validate-ingredient.js");

// GET /api/ingredients
const getAllIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll({
      order: [['expire_date', 'ASC']],
  });
    res.status(200).json(ingredients);
  } catch (err) {
    console.error("Error fetching all ingredients:", err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

// POST /api/ingredients
const createIngredient = async (req, res) => {
  const errors = validateIngredient(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newIngredient = await Ingredient.create(req.body);
    res.status(201).json(newIngredient);
  } catch (err) {
    console.error("Error creating ingredient:", err);
    res.status(400).json({ error: "Failed to create ingredient" });
  }
};

// PUT /api/ingredients/:id
const updateIngredient = async (req, res) => {
  // placeholder
};

// DELETE /api/ingredients/:id
const deleteIngredient = async (req, res) => {
  // placeholder
};

module.exports = {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
