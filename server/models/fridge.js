// server/models/fridge.js
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Fridge extends Model {}

  Fridge.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Fridge",
      tableName: "fridges",
      underscored: true,
      timestamps: true,
    }
  );

  return Fridge;
};
