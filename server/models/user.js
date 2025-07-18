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
      google_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
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
      is_subscribe: {
        type: DataTypes.VIRTUAL,
        get() {
          const status = this.getDataValue("subscription_status");
          return status === "active";
        },
      },
      subscription_status: {
        type: DataTypes.ENUM(
          "incomplete",
          "incomplete_expired",
          "active",
          "past_due",
          "trialing",
          "canceled",
          "unpaid",
          "paused"
        ),
        allowNull: true,
      },
      stripe_subscription_id: {
        type: DataTypes.STRING,
        allowNull: true,
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
