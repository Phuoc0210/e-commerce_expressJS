'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feedbacks', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      product_id: {
        allowNull: false,

        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      user_id: {
        allowNull: false,

        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      star: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.TEXT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Feedbacks');
  },
};
