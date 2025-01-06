'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'company_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('clients', 'year_since', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'company_name');
    await queryInterface.removeColumn('clients', 'year_since');
  }
};
