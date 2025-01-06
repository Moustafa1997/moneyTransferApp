'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'cash_transaction_by', {
      type: Sequelize.ENUM('agency', 'associateClient'),
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'cash_transaction_by_client_id', {
      type: Sequelize.BIGINT,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('transactions', 'cash_transaction_by');
    await queryInterface.removeColumn('transactions', 'cash_transaction_by_client_id');
  }
};
