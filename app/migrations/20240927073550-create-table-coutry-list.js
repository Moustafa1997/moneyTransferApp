'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('country_codes', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      short_name: {
        type: Sequelize.STRING(255), // changed to snake case
        allowNull: false
      },
      dial_code: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      currency_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      currency_code: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE, // changed to snake case
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE, // changed to snake case
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      deleted_at: {
        type: Sequelize.DATE, // changed to snake case
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('country_codes');
  }
};
