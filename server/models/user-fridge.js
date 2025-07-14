"use strict";
const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class UserFridge extends Model {}
    UserFridge.init(
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      fridge_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
    },
    { sequelize,
      modelName: 'UserFridge',
      tableName: 'users_fridges',
      underscored: true,
      timestamps: true, 
    }
  );

  return UserFridge;
};