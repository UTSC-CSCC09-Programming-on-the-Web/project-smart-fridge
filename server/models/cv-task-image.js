"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CvTaskImage extends Model {}

  CvTaskImage.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      cv_task_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      original_filename: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "done", "failed"),
        defaultValue: "pending",
      },
      result: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CvTaskImage",
      tableName: "cv_task_images",
      timestamps: true,
      underscored: true,
    }
  );

  return CvTaskImage;
};
