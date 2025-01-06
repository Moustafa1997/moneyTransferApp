'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('cash_transactions', 'created_by_type', {
      type: Sequelize.ENUM('1', '2', '3'),
      allowNull: true
    });
    await queryInterface.addColumn('cash_transactions', 'created_by_id', {
      type: Sequelize.BIGINT,
      allowNull: true
    });
    await queryInterface.addColumn('cash_transactions', 'un_registered_sender_client_details', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('cash_transactions', 'created_by_type');
    await queryInterface.removeColumn('cash_transactions', 'created_by_id');
    await queryInterface.removeColumn('cash_transactions', 'un_registered_sender_client_details');
  }
};
