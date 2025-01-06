'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'commissions', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Stores commission details like { fee: <value>, purpose: <value> }'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'commissions');
  }
};
