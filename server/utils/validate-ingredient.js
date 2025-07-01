'use strict';

function validateIngredient(ingredient) {
  const errors = [];

  if (!ingredient.name || typeof ingredient.name !== 'string') {
    errors.push('Invalid or missing name');
  }

  if (ingredient.quantity == null || typeof ingredient.quantity !== 'number') {
    errors.push('Invalid or missing quantity');
  }

  if (!ingredient.unit || typeof ingredient.unit !== 'string') {
    errors.push('Invalid or missing unit');
  }

  if (!ingredient.expire_date || isNaN(Date.parse(ingredient.expire_date))) {
    errors.push('Invalid or missing expire_date');
  }

  if (!ingredient.fridge_id || typeof ingredient.fridge_id !== 'string') {
    errors.push('Invalid or missing fridge_id');
  }

  return errors;
}

module.exports = validateIngredient;