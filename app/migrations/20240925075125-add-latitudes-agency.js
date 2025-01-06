'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agencies', 'location_latitude', {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true
    });
    await queryInterface.addColumn('agencies', 'location_longitude', {
      type: Sequelize.DECIMAL(9, 6),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agencies', 'location_latitude');
    await queryInterface.removeColumn('agencies', 'location_longitude');
  }
};
