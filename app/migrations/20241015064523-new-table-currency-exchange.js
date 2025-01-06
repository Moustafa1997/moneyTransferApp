'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create the currency_exchanges table
    await queryInterface.createTable('currency_exchanges', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      country_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'country_codes',
          key: 'id'
        }
      },
      commission_in_percentage: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      exchange_rate: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface) => {
    // Drop the currency_exchanges table and foreign key constraint
    await queryInterface.dropTable('currency_exchanges');
  }
};
