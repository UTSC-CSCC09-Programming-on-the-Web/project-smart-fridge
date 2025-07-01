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
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ingredient ID' });
  }
  const updates = req.body;
    const errors = validateIngredient(updates);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    await ingredient.update(updates);
    res.status(200).json(ingredient);
  } catch (err) {
    console.error('Error updating ingredient:', err);
    res.status(400).json({ error: 'Failed to update ingredient' });
  }
};

// DELETE /api/ingredients/:id
const deleteIngredient = async (req, res) => {
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ingredient ID' });
  }

  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    await ingredient.destroy();
    res.status(204).send(); 
  } catch (err) {
    console.error('Error deleting ingredient:', err);
    res.status(400).json({ error: 'Failed to delete ingredient' });
  }
};

module.exports = {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
