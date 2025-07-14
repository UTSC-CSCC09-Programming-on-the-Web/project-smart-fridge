'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      google_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_first_login: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      subscription_status: {
        type: Sequelize.ENUM(
          'incomplete',
          'incomplete_expired',
          'active',
          'past_due',
          'trialing',
          'canceled',
          'unpaid',
          'paused'
        ),
        allowNull: true,
      },
      stripe_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};