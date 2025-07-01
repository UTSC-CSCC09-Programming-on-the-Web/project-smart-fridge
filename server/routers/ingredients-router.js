'use strict';

const express = require('express');
const {
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} = require('../controllers/ingredients-controller.js');

const router = express.Router();

router.get('/', getAllIngredients);
router.post('/', createIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);

module.exports = router;