// server/models/user.js
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {}

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_first_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_subscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      stripe_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
