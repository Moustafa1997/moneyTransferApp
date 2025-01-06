'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'unregistered_client_details', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('transactions', 'is_registered_client', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('transactions', 'unregistered_client_details');
    await queryInterface.removeColumn('transactions', 'is_registered_client');
  }
};
