"use strict";

function validateIngredient(ingredient) {
  const errors = [];

  // name
  if (
    !ingredient.name ||
    typeof ingredient.name !== "string" ||
    ingredient.name.trim() === ""
  ) {
    errors.push("Invalid or missing name");
  }

  // quantity
  const quantity = parseFloat(ingredient.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.push("Invalid or missing quantity");
  } else {
    ingredient.quantity = quantity;
  }

  // unit
  if (
    !ingredient.unit ||
    typeof ingredient.unit !== "string" ||
    ingredient.unit.trim() === ""
  ) {
    errors.push("Invalid or missing unit");
  }

  // expire_date
  if (!ingredient.expire_date || isNaN(Date.parse(ingredient.expire_date))) {
    errors.push("Invalid or missing expire_date");
  }

  // fridge_id
  if (!ingredient.fridge_id || typeof ingredient.fridge_id !== "string") {
    errors.push("Invalid or missing fridge_id");
  }

  return errors;
}

module.exports = validateIngredient;
