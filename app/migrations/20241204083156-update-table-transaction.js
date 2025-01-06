'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'documentNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'uniqueCode', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('transactions', 'documentTypeId', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: {
          tableName: 'document_types',
          key: 'id'
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('transactions', 'documentNumber');
    await queryInterface.removeColumn('transactions', 'uniqueCode');
    await queryInterface.removeColumn('transactions', 'documentTypeId');
  }
};
