'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('wallets', 'pending_amount', {
      type: Sequelize.DOUBLE,
      allowNull: false,
      defaultValue: 0.0 // Default value for pendingAmount
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('wallets', 'pending_amount');
  }
};
