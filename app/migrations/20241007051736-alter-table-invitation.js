'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('invitations', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('invitations', 'invited_to_agency', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: {
          tableName: 'agencies',
          key: 'id'
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('invitations', 'phone');
    await queryInterface.removeColumn('invitations', 'invited_to_agency');
  }
};
