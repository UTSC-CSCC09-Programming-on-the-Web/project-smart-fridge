// File: server/controllers/ingredients-controller.js

const { Ingredient } = require("../models/index.js");
const validateIngredient = require("../utils/validate-ingredient.js");
const { Op, where, DATE } = require("sequelize");
const path = require("path");
const fs = require("fs");

// for infintie scroll pagination, we use expire date and id as cursors
// GET /api/ingredients?limit=10&expireDateCursor=2025-07-01&idCursor=123
const getIngredientsInfiniteScroll = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const expireCursor = req.query.expireDateCursor
    ? new Date(req.query.expireDateCursor)
    : null;
  const idCursor = req.query.idCursor ? parseInt(req.query.idCursor) : null;

  const where = {};

  if (expireCursor != null && idCursor != null) {
    where[Op.or] = [
      { expire_date: { [Op.gt]: expireCursor } }, // Get ingredients with a later expire date
      {
        // Ensure we only get ingredients with a later ID if the expire date is the same
        expire_date: expireCursor,
        id: { [Op.gt]: idCursor },
      },
    ];
  }

  try {
    const ingredients = await Ingredient.findAll({
      where,
      order: [
        ["expire_date", "ASC"],
        ["id", "ASC"],
      ],
      limit,
    });

    if (ingredients.length === 0) {
      return res.status(200).json({
        ingredients: [],
        nextExpireCursor: null,
        nextIdCursor: null,
      });
    }

    // If we have results, get the last ingredient's ID for cursor
    const last = ingredients[ingredients.length - 1];
    const nextExpireCursor = last.expire_date;
    const nextIdCursor = last.id;
    res.status(200).json({
      ingredients,
      nextExpireCursor,
      nextIdCursor,
    });
  } catch (err) {
    console.error("Error fetching all ingredients:", err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

// POST /api/ingredients
const createIngredient = async (req, res) => {
  // console.log("Creating ingredient with body:", req.body);

  // the req body we get for now are all stings, later we will handle this type and validation problem
  // const errors = validateIngredient(req.body);
  // if (errors.length > 0) {
  //   return res.status(400).json({ errors });
  // }

  try {

    const image_url = req.file
      ? `/uploads/ingredients/${req.file.filename}`
      : null; // will change to default image url

    const newIngredient = await Ingredient.create({
      ...req.body,           
      image_url,             
    });

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
    return res.status(400).json({ error: "Invalid ingredient ID" });
  }
  const updates = req.body;
  const errors = validateIngredient(updates);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    await ingredient.update(updates);
    res.status(200).json(ingredient);
  } catch (err) {
    console.error("Error updating ingredient:", err);
    res.status(400).json({ error: "Failed to update ingredient" });
  }
};

// DELETE /api/ingredients/:id
const deleteIngredient = async (req, res) => {
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid ingredient ID" });
  }

  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (ingredient.image_url) {
      const imagePath = path.join(__dirname, '..', ingredient.image_url);
      console.log('Deleting image at:', imagePath);
      try {
        await fs.promises.unlink(imagePath);
        console.log(`Image deleted: ${imagePath}`);
      } catch (err) {
        console.warn(`Warning: Failed to delete image: ${imagePath}`, err);
      }
    }

    await ingredient.destroy();
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting ingredient:", err);
    res.status(400).json({ error: "Failed to delete ingredient" });
  }
};

module.exports = {
  getIngredientsInfiniteScroll,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
