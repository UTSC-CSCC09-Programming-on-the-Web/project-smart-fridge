const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class CvTask extends Model {}

  CvTask.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      trace_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
      },
      task_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
      },
      job_type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fridge_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "done", "failed"),
        defaultValue: "pending",
      },
      images_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      done_images_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      failed_images_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "CvTask",
      tableName: "cv_tasks",
      timestamps: true,
      underscored: true,
    }
  );

  return CvTask;
};
