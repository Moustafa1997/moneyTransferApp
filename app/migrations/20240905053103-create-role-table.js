'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER
      },
      role_title: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      role_type: {
        // 1= frontend role, 2= backend role
        allowNull: true,
        type: Sequelize.ENUM('1', '2')
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('roles');
  }
};
