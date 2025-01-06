'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('clients', 'status', 'chat_status');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('clients', 'chat_status', 'status');
  }
};
