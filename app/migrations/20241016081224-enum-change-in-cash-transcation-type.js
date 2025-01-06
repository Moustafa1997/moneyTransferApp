'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('cash_transactions', 'type', {
      type: Sequelize.ENUM('1', '2', '3', '4', '5', '6'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('cash_transactions', 'type', {
      type: Sequelize.ENUM('1', '2'),
      allowNull: false
    });
  }
};
