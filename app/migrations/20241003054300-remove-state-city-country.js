'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn('clients', 'country');
    await queryInterface.removeColumn('clients', 'state');
    await queryInterface.removeColumn('clients', 'city');
    await queryInterface.removeColumn('agencies', 'country');
    await queryInterface.removeColumn('agencies', 'state');
    await queryInterface.removeColumn('agencies', 'city');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('clients', 'state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('clients', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('agencies', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('agencies', 'state', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('agencies', 'city', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
