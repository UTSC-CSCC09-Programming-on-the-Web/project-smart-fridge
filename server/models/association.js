// File: server/models/association.js
// This file defines the associations between models in the Sequelize ORM.

"use strict";

module.exports = (db) => {
  const { User, Fridge, Ingredient, UserFridge } = db;
  // User <> Fridge ( N:N), but for now only supporting N:1 relationship
  // this means multiple users can have the same fridge, but each user can only have one fridge
  User.belongsToMany(Fridge, {
    through: UserFridge,
    foreignKey: "user_id",
    otherKey: "fridge_id",
    as: "fridges",
  });

  Fridge.belongsToMany(User, {
    through: UserFridge,
    foreignKey: "fridge_id",
    otherKey: "user_id",
    as: "users",
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
