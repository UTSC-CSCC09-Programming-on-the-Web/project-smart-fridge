const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class LlmTask extends Model {}

    LlmTask.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    task_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
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
        type: DataTypes.ENUM('pending', 'processing', 'done', 'failed'),
        defaultValue: 'pending',
    },
    result: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    trace_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
}, 
{   sequelize,
    modelName: 'LlmTask',
    tableName: 'llm_tasks',
    timestamps: true,
    underscored: true,
}
);

 return LlmTask;
};