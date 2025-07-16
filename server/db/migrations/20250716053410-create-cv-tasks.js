'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cv_tasks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      task_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      job_type: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fridge_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'fridges',
          key: 'id', 
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',   
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'done', 'failed'),
        defaultValue: 'pending',
      },
      trace_id: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      images_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      done_images_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },  
      failed_images_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
    await queryInterface.addConstraint('cv_tasks', {
      fields: ['done_images_count', 'failed_images_count', 'images_count'],
      type: 'check',
      name: 'check_cv_task_image_counts_valid',
      where: Sequelize.literal(
        '"done_images_count" + "failed_images_count" <= "images_count"'
      ),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cv_tasks');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_cv_tasks_status;');
    
  },
};