'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('clients', 'last_seen', {
      type: Sequelize.DATE,
      allowNull: true,
      field: 'last_seen'
    });

    await queryInterface.addColumn('clients', 'status', {
      type: Sequelize.ENUM('online', 'offline'),
      defaultValue: 'offline',
      allowNull: false,
      field: 'status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('clients', 'last_seen');
    await queryInterface.removeColumn('clients', 'status');
  }
};
