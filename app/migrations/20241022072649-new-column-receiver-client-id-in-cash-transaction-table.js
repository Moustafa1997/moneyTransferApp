'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cash_transactions', 'receiver_client_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'clients',
        key: 'id'
      }
    });
    await queryInterface.addColumn('cash_transactions', 'receiver_client_is_registered', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('cash_transactions', 'receiver_client_id');
    await queryInterface.removeColumn('cash_transactions', 'receiver_client_is_registered');
  }
};
