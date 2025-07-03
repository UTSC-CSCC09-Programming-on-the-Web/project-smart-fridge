// File: server/models/association.js
// This file defines the associations between models in the Sequelize ORM.

"use strict";

module.exports = (db) => {
  const { User, Fridge, Ingredient } = db;
  // User <> Fridge (1:1)
  User.hasOne(Fridge, {
    foreignKey: {
      name: "user_id",
      allowNull: false,
      unique: true,
    },
    as: "fridge",
    onDelete: "CASCADE",
    hooks: true,
  });
  Fridge.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  // Fridge <> Ingredient (1:N)
  Fridge.hasMany(Ingredient, {
    foreignKey: {
      name: "fridge_id",
      allowNull: false,
    },
    as: "ingredients",
    onDelete: "CASCADE",
    hooks: true,
  });
  Ingredient.belongsTo(Fridge, {
    foreignKey: "fridge_id",
    as: "fridge",
  });
};
