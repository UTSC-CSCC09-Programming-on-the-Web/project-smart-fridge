// File: server/controllers/ingredients-controller.js
"use strict";
const { Ingredient } = require("../models/index.js");
const validateIngredient = require("../utils/validate-ingredient.js");
const { Op, where, DATE } = require("sequelize");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
const { getImageUrl } = require("../utils/image-url.js");
const { deleteFileFromGCS } = require("../services/gcs-storage-service.js");
const Mutex = require("redis-semaphore").Mutex;
const redisBullmq = require("../redis/redis-bullmq.js");
const {
  lockLostHandling,
  ingredientMutex,
} = require("../services/fridge-lock-service.js");
const parseIndexedFormData = require("../utils/parse-index-formdata.js");
const { notifyFridgeUpdateEvent } = require("../utils/notify-event.js");

// for infintie scroll pagination, we use expire date and id as cursors
// GET /api/fridges/:fridgeId/ingredients?limit=10&expireDateCursor=2025-07-01&idCursor=123
const getIngredientsInfiniteScroll = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const expireCursor = req.query.expireDateCursor
    ? new Date(req.query.expireDateCursor)
    : null;
  const idCursor = req.query.idCursor ? parseInt(req.query.idCursor) : null;
  const fridgeId = req.fridgeId || req.params.fridge_id;
  if (!fridgeId) {
    return res.status(400).json({ error: "Invalid fridge ID" });
  }
  const where = { fridge_id: fridgeId };

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

    const formattedIngredients = ingredients.map((ingredient) => {
      const json = ingredient.toJSON();
      json.image_url = getImageUrl(json.image_url);
      return json;
    });

    // If we have results, get the last ingredient's ID for cursor
    const last = ingredients[ingredients.length - 1];
    const nextExpireCursor = last.expire_date;
    const nextIdCursor = last.id;
    res.status(200).json({
      ingredients: formattedIngredients,
      nextExpireCursor,
      nextIdCursor,
    });
  } catch (err) {
    console.error("Error fetching all ingredients:", err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

// POST /api/fridges/:fridgeId/Ingredients
const createIngredient = async (req, res) => {
  // console.log("Creating ingredient with body:", req.body);

  // the req body we get for now are all stings, later we will handle this type and validation problem
  // const errors = validateIngredient(req.body);
  // if (errors.length > 0) {
  //   return res.status(400).json({ errors });
  // }
  const fridgeId = req.fridgeId || req.params.fridge_id;
  if (!fridgeId) {
    return res.status(400).json({ error: "Invalid fridge ID" });
  }

  const lockIdentifier = req.fridgeLockIdentifier;
  if (!lockIdentifier) {
    return res
      .status(423)
      .json({ error: "Fridge is currently locked, please try again later" });
  }
  const mutex = ingredientMutex(fridgeId, lockIdentifier);
  if (!mutex) {
    return res.status(500).json({ error: "Failed to create ingredient mutex" });
  }
  console.log(
    "Acquiring mutex for fridge lock with identifier:",
    lockIdentifier
  );
  await mutex.acquire();
  // await new Promise((resolve) => setTimeout(resolve, 30000)); // Simulate some processing time

  let type;
  try {
    const relativePath = req.file ? req.file.relativePath : null;
    //  console.log("Image URL:", image_url);

    const newIngredient = await Ingredient.create({
      ...req.body,
      fridge_id: fridgeId,
      image_url: relativePath, // Store the relative path to the image
    });
    // console.log("New ingredient created at:", relativePath);

    const ingredientWithImageUrl = {
      ...newIngredient.toJSON(),
      image_url: getImageUrl(newIngredient.image_url),
    };
    console.log("Ingredient with image URL:", ingredientWithImageUrl.image_url);
    type = 'success';
    res.status(201).json(ingredientWithImageUrl);
  } catch (err) {
    console.error("Error creating ingredient:", err);
    type = 'error';
    res.status(400).json({ error: "Failed to create ingredient" });
  } finally {
    console.log(
      "Releasing mutex for fridge lock with identifier:",
      lockIdentifier
    );
    await mutex.release();
    notifyFridgeUpdateEvent(req.user.id, fridgeId, type, 'add one', {
      ingredientName: req.body.name || null,
    });
  }
};

const createMultiIngredients = async (req, res) => {
  const fridgeId = req.fridgeId || req.params.fridge_id;
  if (!fridgeId) {
    return res.status(400).json({ error: "Invalid fridge ID" });
  }
  const lockIdentifier = req.fridgeLockIdentifier;
  if (!lockIdentifier) {
    return res
      .status(423)
      .json({ error: "Fridge is currently locked, please try again later" });
  }
  const mutex = ingredientMutex(fridgeId, lockIdentifier);
  if (!mutex) {
    return res.status(500).json({ error: "Failed to create ingredient mutex" });
  }
  console.log(
    "Acquiring mutex for fridge lock with identifier:",
    lockIdentifier
  );
  await mutex.acquire();
  // await new Promise((resolve) => setTimeout(resolve, 30000)); // Simulate some processing time
  let type;
  try {
    const reqResult = parseIndexedFormData(req);
    const ingredients = reqResult.map(({ image, ...rest }) => ({
      ...rest,
      image_url: image ? image.relativePath : null,
      fridge_id: fridgeId,
    }));
    const newIngredients = await Ingredient.bulkCreate(ingredients);

    const ingredientsWithImageUrl = newIngredients.map((ingredient) => ({
      ...ingredient.toJSON(),
      image_url: getImageUrl(ingredient.image_url),
    }));
    type = 'success';
    res.status(201).json(ingredientsWithImageUrl);
  } catch (err) {
    console.error("Error creating ingredient:", err);
    type = 'error';
    res.status(400).json({ error: "Failed to create ingredient" });
  } finally {
    console.log(
      "Releasing mutex for fridge lock with identifier:",
      lockIdentifier
    );
    await mutex.release();
    notifyFridgeUpdateEvent(req.user.id, fridgeId, type, 'add multi', {
      ingredientsQty: newIngredients.length || 0,
      error: err.message || null,
    });
  }
};

// PUT /api/fridges/:fridgeId/ingredients/:id
const updateIngredient = async (req, res) => {
  const fridgeId = req.fridgeId || req.params.fridge_id;
  if (!fridgeId) {
    return res.status(400).json({ error: "Invalid fridge ID" });
  }

  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid ingredient ID" });
  }
  const updates = req.body;
  const errors = validateIngredient(updates);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const lockIdentifier = req.fridgeLockIdentifier;
  if (!lockIdentifier) {
    return res
      .status(423)
      .json({ error: "Fridge is currently locked, please try again later" });
  }
  const mutex = ingredientMutex(fridgeId, lockIdentifier);
  if (!mutex) {
    return res.status(500).json({ error: "Failed to create ingredient mutex" });
  }
  console.log(
    "[Ingredient controller] Acquiring mutex for fridge lock with identifier:",
    lockIdentifier
  );
  await mutex.acquire();
  let type;
  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }
    await ingredient.update(updates, {
      fields: ["name", "quantity", "unit", "expire_date", "type"],
    });
    ingredient.image_url = getImageUrl(ingredient.image_url);
    type = 'success';
    res.status(200).json(ingredient);
  } catch (err) {
    console.error("Error updating ingredient:", err);
    type = 'error';
    res.status(400).json({ error: "Failed to update ingredient" });
  } finally {
    await mutex.release();
    notifyFridgeUpdateEvent(req.user.id, fridgeId, type, 'modify', {
      ingredientName: req.body.name || null,
      error: err.message || null,
    });
  }
};

// DELETE /api/fridges/:fridgeId/ingredients/:id
const deleteIngredient = async (req, res) => {
  const fridgeId = req.fridgeId || req.params.fridge_id;
  if (!fridgeId) {
    return res.status(400).json({ error: "Invalid fridge ID" });
  }
  const id = req.params.id;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid ingredient ID" });
  }

  const lockIdentifier = req.fridgeLockIdentifier;
  if (!lockIdentifier) {
    return res
      .status(423)
      .json({ error: "Fridge is currently locked, please try again later" });
  }
  const mutex = ingredientMutex(fridgeId, lockIdentifier);
  if (!mutex) {
    return res.status(500).json({ error: "Failed to create ingredient mutex" });
  }
  await mutex.acquire();
  let type;
  try {
    const ingredient = await Ingredient.findByPk(id);
    if (!ingredient) {
      return res.status(404).json({ error: "Ingredient not found" });
    }

    if (ingredient.image_url) {
      const imagePath = ingredient.image_url;
      console.log("Deleting image at:", imagePath);
      try {
        await deleteFileFromGCS(imagePath);
        console.log(`Image deleted: ${imagePath}`);
      } catch (err) {
        console.warn(`Warning: Failed to delete image: ${imagePath}`, err);
      }
    }

    await ingredient.destroy();
    type = 'success';
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting ingredient:", err);
    type = 'error';
    res.status(400).json({ error: "Failed to delete ingredient" });
  } finally {
    await mutex.release();
    notifyFridgeUpdateEvent(req.user.id, fridgeId, type, 'delete', {
      ingredientName: req.body.name || null,
      error: err.message || null,
    });
  }
};

module.exports = {
  getIngredientsInfiniteScroll,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  createMultiIngredients,
};
