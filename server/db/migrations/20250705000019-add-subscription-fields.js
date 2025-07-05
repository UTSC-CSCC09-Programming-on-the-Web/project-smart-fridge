'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'subscription_status', {
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'subscription_status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_subscription_status";'
    );
  },
};