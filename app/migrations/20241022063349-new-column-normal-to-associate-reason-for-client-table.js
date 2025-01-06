'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'reason_for_normal_to_associate', {
      type: Sequelize.STRING(255),
      allowNull: true,
      field: 'reason_for_normal_to_associate'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'reason_for_normal_to_associate');
  }
};
