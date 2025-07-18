"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users_fridges", {
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      fridge_id: {
        type: Sequelize.UUID,
        references: {
          model: "fridges",
          key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("users_fridges", {
      fields: ["user_id", "fridge_id"],
      type: "unique",
      name: "unique_user_fridge",
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("users_fridges");
  },
};
