'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('permissions', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT, // bigint
        allowNull: false
      },
      permission: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      group: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('permissions');
  }
};
