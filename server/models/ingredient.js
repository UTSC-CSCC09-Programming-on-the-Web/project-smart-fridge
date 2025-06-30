// File: server/models/ingredient.js
'use strict';
const { DataTypes, Model} = require('sequelize');

// note: all the asscoiations are defined in server/models/association.js
module.exports = (sequelize) => {
  class Ingredient extends Model {}

  Ingredient.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
      },
      is_expired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      fridge_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Ingredient',
      tableName: 'Ingredients', // // match with migration table name in server/migrations/20250630221400-create-ingredient.js
      timestamps: true, // enables createdAt and updatedAt fields
      underscored: true, // use snake_case for column names
    }
  );

  return Ingredient;
};